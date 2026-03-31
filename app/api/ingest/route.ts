import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import prisma from "@/app/lib/prisma";
import sharp from "sharp";
import exifr from "exifr";
// Allow scaling up payload size if astrophotography images are large
export const maxDuration = 60; // 60 seconds

export async function POST(req: NextRequest) {
    try {
        // 1. Basic Security: API Key Check
        const authHeader = req.headers.get("authorization");
        const apiKey = process.env.INGEST_API_KEY;

        if (!apiKey || authHeader !== `Bearer ${apiKey}`) {
            console.warn("Unauthorized ingest attempt");
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // 2. Parse FormData
        const formData = await req.formData();
        const file = formData.get("file") as File;

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        console.log(`[Ingest API] Received file: ${file.name} (${file.size} bytes)`);

        // 3. Create 3-Tier File System (600px Thumb + 2560px Display + Original)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Extract absolute true telescope dimensions for aspect ratio calculations
        const metadata = await sharp(buffer).metadata();
        const originalWidth = metadata.width || 1080;
        const originalHeight = metadata.height || 1080;
        const aspectRatio = originalHeight / originalWidth;
        
        // TIER 1: Thumbnail (600px max width) — masonry grid cards, fast loading
        const thumbMaxWidth = 600;
        const thumbWidth = Math.min(originalWidth, thumbMaxWidth);
        const thumbHeight = Math.round(aspectRatio * thumbWidth);

        // TIER 2: Display (2560px max width) — lightbox viewing, crisp on retina
        const displayMaxWidth = 2560;
        const displayWidth = Math.min(originalWidth, displayMaxWidth);
        const displayHeight = Math.round(aspectRatio * displayWidth);

        // Ensure directory exists
        const uploadDir = join(process.cwd(), "public/uploads");
        await mkdir(uploadDir, { recursive: true });

        const safeFilename = file.name.replace(/\s/g, "-");
        const timestamp = Date.now();
        const thumbFilename = `${timestamp}-thumb-${safeFilename}`;
        const displayFilename = `${timestamp}-display-${safeFilename}`;
        const highResFilename = `${timestamp}-highres-${safeFilename}`;

        // Path definitions
        const thumbFilepath = join(uploadDir, thumbFilename);
        const displayFilepath = join(uploadDir, displayFilename);
        const highResFilepath = join(uploadDir, highResFilename);

        // A) Save untouched original High-Res Buffer (TIER 3)
        await writeFile(highResFilepath, buffer);

        // B) Generate display version for lightbox (TIER 2)
        const displayBuffer = await sharp(buffer)
            .resize(displayWidth, displayHeight, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toBuffer();
        await writeFile(displayFilepath, displayBuffer);

        // C) Generate small thumbnail for masonry grids (TIER 1)
        const thumbBuffer = await sharp(buffer)
            .resize(thumbWidth, thumbHeight, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        await writeFile(thumbFilepath, thumbBuffer);

        const url = `/uploads/${thumbFilename}`;
        const displayUrl = `/uploads/${displayFilename}`;
        const highResUrl = `/uploads/${highResFilename}`;

        // 4. Send to Local Ollama (LLaVA) for AI Analysis
        let title = "Auto Upload";
        let description = null;
        let albumId = null;

        try {
            console.log("[Ingest API] Sending image to local Ollama (LLaVA) for analysis...");
            const base64Image = buffer.toString("base64");
            
            // Phase 8c: Parse EXIF data from astronomical fits/jpegs
            let exifContext = "";
            try {
                // we use the original buffer, extract anything remotely looking like text/metadata
                const parsedExif = await exifr.parse(buffer, { gps: false });
                if (parsedExif) {
                    const keysToKeep = ["Make", "Model", "Software", "DateTimeOriginal", "UserComment", "ImageDescription", "Subject", "Title"];
                    const relevantData = Object.entries(parsedExif).filter(([key, value]) => {
                        return keysToKeep.includes(key) || (typeof value === "string" && value.length > 2);
                    }).slice(0, 8); // Keep it strictly brief so LLaVA doesn't get overwhelmed

                    if (relevantData.length > 0) {
                        const metadataPayload = Object.fromEntries(relevantData);
                        exifContext = `\n\nCRITICAL CONTEXT FROM EMBEDDED TELESCOPE METADATA:\n${JSON.stringify(metadataPayload, null, 2)}\n\nUse this exact metadata to confidently identify the celestial object, correct its name, and determine its album category.`;
                    }
                }
            } catch (exifErr) {
                console.log("[Ingest API] No readable EXIF data found");
            }

            // Phase 8d & 8g: Precision AI Prompt Architecture Tuning
            const aiPrompt = `Analyze this astrophotography or celestial image.${exifContext}
            
Return ONLY a valid JSON object matching this exact shape, nothing else:
{
  "title": "A highly precise, aesthetic 2-5 word title (e.g. 'Andromeda Galaxy', 'Orion Nebula', 'Full Moon')",
  "description": "A 1-2 sentence description explaining exactly what is visible astronomically.",
                "albumName": "Choose EXACTLY ONE category: 'Solar System', 'Moon', 'Sun', 'Galaxies', 'Nebula', 'Superclusters', 'Constellations', or 'Comets'"
}`;

            // Make request with a strict 30 second timeout for the AI
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const ollamaRes = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    model: "llava",
                    prompt: aiPrompt,
                    images: [base64Image],
                    stream: false,
                    format: "json",
                }),
            });
            clearTimeout(timeoutId);

            if (ollamaRes.ok) {
                const aiData = await ollamaRes.json();
                const parsed = JSON.parse(aiData.response);
                
                if (parsed.title) title = parsed.title;
                if (parsed.description) description = parsed.description;
                
                // Map album Name to Album ID
                if (parsed.albumName) {
                    const album = await prisma.album.findFirst({
                        where: { name: parsed.albumName }
                    });
                    
                    if (album) {
                        albumId = album.id;
                    } else {
                        // Fallback mapping or null: Phase 8.5 strictly forbids ad-hoc album creation.
                        // We could map invalid names to null (Uncategorized) so the user can manually sort them.
                        console.warn(`[Ingest API] AI hallucinated unapproved album: ${parsed.albumName}`);
                    }
                }
                console.log("[Ingest API] LLaVA Analysis Success:", parsed);
            } else {
                console.warn("[Ingest API] Ollama replied with error status", ollamaRes.status);
            }
        } catch (aiError) {
            console.warn("[Ingest API] Failed to connect to local Ollama. Falling back to default metadata. (Is Ollama running?)");
        }

        // 5. Save to Database
        const photo = await prisma.photo.create({
            data: {
                url,
                displayUrl,
                highResUrl,
                width: displayWidth,
                height: displayHeight,
                title,
                description,
                albumId
            },
        });

        console.log(`[Ingest API] Success! Saved photo ID: ${photo.id}`);

        // 5. Return success
        return NextResponse.json({
            success: true,
            photo,
            message: "File stored securely.",
        });

    } catch (error: any) {
        console.error("[Ingest API] Error processing file:", error);
        return NextResponse.json(
            { error: "Internal server error during ingestion", details: error.message, stack: error.stack },
            { status: 500 }
        );
    }
}
