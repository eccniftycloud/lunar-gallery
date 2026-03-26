import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import prisma from "@/app/lib/prisma";
import sharp from "sharp";

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

        // 3. Create Dual-File System (1080p Thumbnail + Ultra High Res Original)
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Ensure directory exists
        const uploadDir = join(process.cwd(), "public/uploads");
        await mkdir(uploadDir, { recursive: true });

        const safeFilename = file.name.replace(/\s/g, "-");
        const timestamp = Date.now();
        const thumbFilename = `${timestamp}-thumb-${safeFilename}`;
        const highResFilename = `${timestamp}-highres-${safeFilename}`;

        // Path definitions
        const thumbFilepath = join(uploadDir, thumbFilename);
        const highResFilepath = join(uploadDir, highResFilename);

        // A) Save untouched original High-Res Buffer
        await writeFile(highResFilepath, buffer);

        // B) Generate 1080x1080 thumbnail for grids
        const thumbBuffer = await sharp(buffer)
            .resize(1080, 1080, { fit: "cover", withoutEnlargement: true })
            .toBuffer();
        await writeFile(thumbFilepath, thumbBuffer);

        const url = `/uploads/${thumbFilename}`;
        const highResUrl = `/uploads/${highResFilename}`;

        // 4. Send to Local Ollama (LLaVA) for AI Analysis
        let title = "Auto Upload";
        let description = null;
        let albumId = null;

        try {
            console.log("[Ingest API] Sending image to local Ollama (LLaVA) for analysis...");
            const base64Image = buffer.toString("base64");
            const aiPrompt = `Analyze this astrophotography or celestial image. Return ONLY a valid JSON object matching this exact shape, nothing else:
{
  "title": "A short, beautiful 2-4 word title for the image",
  "description": "A 1-2 sentence description of what is visible in the image",
  "albumName": "Choose ONE: 'Solar System', 'Deep Space', 'Lunar', or 'Terrestrial'"
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
                        // Create album on the fly if it doesn't exist
                        const newAlbum = await prisma.album.create({
                            data: {
                                name: parsed.albumName,
                                coverImage: url
                            }
                        });
                        albumId = newAlbum.id;
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
                highResUrl,
                width: 1080,
                height: 1080,
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

    } catch (error) {
        console.error("[Ingest API] Error processing file:", error);
        return NextResponse.json(
            { error: "Internal server error during ingestion" },
            { status: 500 }
        );
    }
}
