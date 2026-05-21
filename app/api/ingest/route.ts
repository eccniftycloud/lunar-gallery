import { NextRequest, NextResponse } from "next/server";
import { join } from "path";
import { writeFile, mkdir } from "fs/promises";
import prisma from "@/app/lib/prisma";
import sharp from "sharp";
import exifr from "exifr";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
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
        let originalWidth = metadata.width || 1080;
        let originalHeight = metadata.height || 1080;

        // Optional: Rotate Seestar S50 portrait images to landscape
        // The Seestar S50 sensor captures 1920×1080 (16:9 landscape) but the mount
        // outputs 1080×1920 (portrait). This rotates them to their natural orientation.
        let processBuffer: any = buffer; // working buffer (may be rotated)
        const rotateSeestar = process.env.ROTATE_SEESTAR === 'true';
        
        if (rotateSeestar && originalHeight > originalWidth) {
            // Check EXIF for Seestar/ZWO identification
            let isSeestar = false;
            try {
                const exif = await exifr.parse(buffer, { gps: false });
                if (exif) {
                    const makeModel = `${exif.Make || ''} ${exif.Model || ''} ${exif.Software || ''}`.toLowerCase();
                    isSeestar = makeModel.includes('seestar') || makeModel.includes('zwo');
                }
            } catch { /* no exif — skip */ }

            // Also detect by exact Seestar S50 dimensions (1080×1920 or 1080×1963)
            if (!isSeestar && originalWidth === 1080 && (originalHeight === 1920 || originalHeight === 1963)) {
                isSeestar = true;
            }

            if (isSeestar) {
                console.log(`[Ingest API] Rotating Seestar image from ${originalWidth}×${originalHeight} to landscape`);
                processBuffer = await sharp(buffer).rotate(90).toBuffer();
                // Dimensions swap after 90° rotation
                const rotatedMeta = await sharp(processBuffer).metadata();
                originalWidth = rotatedMeta.width || originalHeight;
                originalHeight = rotatedMeta.height || originalWidth;
                console.log(`[Ingest API] Rotated to ${originalWidth}×${originalHeight}`);
            }
        }

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

        // A) Save untouched original High-Res Buffer (TIER 3) — always the original, never rotated
        await writeFile(highResFilepath, buffer);

        // B) Generate display version for lightbox (TIER 2) — uses processBuffer (rotated if applicable)
        const displayBuffer = await sharp(processBuffer)
            .resize(displayWidth, displayHeight, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 90 })
            .toBuffer();
        await writeFile(displayFilepath, displayBuffer);

        // C) Generate small thumbnail for masonry grids (TIER 1) — uses processBuffer (rotated if applicable)
        const thumbBuffer = await sharp(processBuffer)
            .resize(thumbWidth, thumbHeight, { fit: "inside", withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        await writeFile(thumbFilepath, thumbBuffer);

        const url = `/uploads/${thumbFilename}`;
        const displayUrl = `/uploads/${displayFilename}`;
        const highResUrl = `/uploads/${highResFilename}`;

        // Extract dominant color for cosmic skeleton tinting (Phase 10d)
        let dominantColor: string | null = null;
        try {
            const { dominant } = await sharp(thumbBuffer).stats();
            dominantColor = `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`;
        } catch {
            // Non-critical
        }

        // 4. Fetch AI Context & Configuration
        let title = "Auto Upload";
        let description = null;
        let albumId = null;
        let tags: string | null = null;
        let technicalData: string | null = null;

        // Phase 11c: Deep EXIF/FITS Telemetry Extraction
        // Extract comprehensive technical specs BEFORE AI analysis so we can inject context AND store independently
        let parsedExif: any = null;
        try {
            parsedExif = await exifr.parse(buffer, {
                gps: false,
                // Request all available EXIF/TIFF/IPTC tags
                tiff: true,
                exif: true,
                iptc: true,
                xmp: true,
            });
        } catch (exifErr) {
            console.log("[Ingest API] No readable EXIF data found");
        }

        // Build technical data object from parsed EXIF
        if (parsedExif) {
            const techSpecs: Record<string, any> = {};

            // Camera/Telescope identification
            if (parsedExif.Make) techSpecs.make = parsedExif.Make;
            if (parsedExif.Model) techSpecs.model = parsedExif.Model;
            if (parsedExif.Software) techSpecs.software = parsedExif.Software;

            // Capture timestamp
            if (parsedExif.DateTimeOriginal) {
                techSpecs.captureDate = parsedExif.DateTimeOriginal instanceof Date
                    ? parsedExif.DateTimeOriginal.toISOString()
                    : String(parsedExif.DateTimeOriginal);
            }

            // Exposure settings
            if (parsedExif.ExposureTime != null) {
                const expTime = parsedExif.ExposureTime;
                techSpecs.exposureTime = expTime < 1
                    ? `1/${Math.round(1 / expTime)}s`
                    : `${expTime}s`;
                techSpecs.exposureTimeRaw = expTime;
            }
            if (parsedExif.ISO != null) techSpecs.iso = parsedExif.ISO;
            if (parsedExif.ISOSpeedRatings != null) techSpecs.iso = parsedExif.ISOSpeedRatings;
            if (parsedExif.FNumber != null) techSpecs.fNumber = `f/${parsedExif.FNumber}`;
            if (parsedExif.FocalLength != null) techSpecs.focalLength = `${parsedExif.FocalLength}mm`;
            if (parsedExif.FocalLengthIn35mmFormat != null) techSpecs.focalLength35mm = `${parsedExif.FocalLengthIn35mmFormat}mm`;

            // Astrophotography-specific fields
            if (parsedExif.Gain != null) techSpecs.gain = parsedExif.Gain;
            if (parsedExif.Temperature != null) techSpecs.sensorTemp = `${parsedExif.Temperature}°C`;
            if (parsedExif.SensorTemperature != null) techSpecs.sensorTemp = `${parsedExif.SensorTemperature}°C`;
            if (parsedExif.CCDTemperature != null) techSpecs.sensorTemp = `${parsedExif.CCDTemperature}°C`;
            if (parsedExif.FrameCount != null) techSpecs.frameCount = parsedExif.FrameCount;
            if (parsedExif.StackCount != null) techSpecs.stackCount = parsedExif.StackCount;

            // Image dimensions
            techSpecs.resolution = `${originalWidth}×${originalHeight}`;

            // User-embedded descriptions/targets (common in telescope software)
            if (parsedExif.ImageDescription) techSpecs.imageDescription = parsedExif.ImageDescription;
            if (parsedExif.UserComment) techSpecs.userComment = parsedExif.UserComment;
            if (parsedExif.Subject) techSpecs.subject = parsedExif.Subject;
            if (parsedExif.Title) techSpecs.title = parsedExif.Title;

            // White balance / color info
            if (parsedExif.WhiteBalance != null) techSpecs.whiteBalance = parsedExif.WhiteBalance;

            // Only store if we have meaningful data beyond just resolution
            if (Object.keys(techSpecs).length > 1) {
                technicalData = JSON.stringify(techSpecs);
                console.log(`[Ingest API] Extracted ${Object.keys(techSpecs).length} technical specs`);
            }
        }

        try {
            let aiMode = "local";
            const config = await prisma.adminConfig.findUnique({ where: { id: "admin" } });
            if (config && config.aiMode) aiMode = config.aiMode;

            console.log(`[Ingest API] Sending image to ${aiMode === "cloud" ? "AWS Bedrock (Cloud AI)" : "local Ollama (LLaVA)"} for analysis...`);
            
            // Generate base64 representations
            // For LLaVA, the original buffer is fine. But for Cloud AI, 
            // sending the thumbBuffer saves bandwidth and Bedrock tokens immensely while retaining enough quality for classification.
            const base64Image = (aiMode === "cloud" ? thumbBuffer : buffer).toString("base64");
            
            // Phase 11c: Build rich EXIF context string for AI prompt injection
            let exifContext = "";
            if (parsedExif) {
                const keysToKeep = [
                    "Make", "Model", "Software", "DateTimeOriginal",
                    "UserComment", "ImageDescription", "Subject", "Title",
                    "ExposureTime", "ISO", "ISOSpeedRatings", "FocalLength",
                    "FNumber", "Gain", "Temperature", "FrameCount"
                ];
                const relevantData = Object.entries(parsedExif).filter(([key, value]) => {
                    return keysToKeep.includes(key) || (typeof value === "string" && value.length > 2);
                }).slice(0, 15); // Allow more context for richer analysis

                if (relevantData.length > 0) {
                    const metadataPayload = Object.fromEntries(relevantData);
                    exifContext = `\n\nCRITICAL CONTEXT FROM EMBEDDED TELESCOPE/CAMERA METADATA:\n${JSON.stringify(metadataPayload, null, 2)}\n\nUse this exact metadata to confidently identify the celestial object, correct its name, reference its catalog designation, and determine its album category. If exposure data is present, consider whether long stacking or tracking was used.`;
                }
            }

            // Phase 11a & 11b: Advanced AI Prompt with rich metadata + tagging
            const aiPrompt = `You are an expert astrophotographer and astronomer analyzing a telescope or camera capture. Study this image carefully.${exifContext}

Return ONLY a valid JSON object matching this EXACT schema — no markdown, no commentary:
{
  "title": "A precise 2-6 word title using the object's common AND catalog name when identifiable (e.g. 'M42 — Orion Nebula', 'NGC 7000 — North America Nebula', 'Waxing Gibbous Moon', 'Jupiter & Galilean Moons'). If a specific deep-sky object is ambiguous, describe what is seen.",
  "description": "A rich 2-4 sentence description. Include: (1) what the object IS astronomically (type, classification), (2) its approximate distance or angular size if known, (3) the constellation it resides in if applicable, (4) any notable visual features visible in this specific capture (e.g. dust lanes, spiral arms, craters, prominences, color regions).",
  "albumName": "Choose EXACTLY ONE: 'Solar System', 'Moon', 'Sun', 'Galaxies', 'Nebula', 'Superclusters', 'Constellations', or 'Comets'",
  "tags": ["3 to 8 descriptive tags as an array of lowercase strings — include object type (e.g. 'emission nebula', 'spiral galaxy', 'lunar crater'), visual characteristics (e.g. 'colorful', 'wide-field', 'high-detail'), and relevant identifiers (e.g. 'messier object', 'ngc catalog', 'planetary')"]
}`;

            let responseText = "";

            if (aiMode === "cloud") {
                // Phase 9c: Bedrock Adapter (Claude 3 Haiku)
                const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });
                
                const payload = {
                    anthropic_version: "bedrock-2023-05-31",
                    max_tokens: 1024,
                    messages: [
                        {
                            role: "user",
                            content: [
                                {
                                    type: "image",
                                    source: {
                                        type: "base64",
                                        media_type: "image/jpeg",
                                        data: base64Image
                                    }
                                },
                                {
                                    type: "text",
                                    text: aiPrompt
                                }
                            ]
                        }
                    ]
                };

                const command = new InvokeModelCommand({
                    contentType: "application/json",
                    body: JSON.stringify(payload),
                    modelId: "anthropic.claude-3-haiku-20240307-v1:0"
                });

                const response = await client.send(command);
                const decodedResponseBody = new TextDecoder().decode(response.body);
                const aiData = JSON.parse(decodedResponseBody);
                responseText = aiData.content[0].text;
                
                // Phase 9e: Cost & Token Telemetry Tracking
                if (aiData.usage) {
                    try {
                        await prisma.adminConfig.update({
                            where: { id: "admin" },
                            data: {
                                bedrockInputTokens: { increment: aiData.usage.input_tokens || 0 },
                                bedrockOutputTokens: { increment: aiData.usage.output_tokens || 0 }
                            }
                        });
                        console.log(`[Ingest API] Logged telemetry: ${aiData.usage.input_tokens} Input / ${aiData.usage.output_tokens} Output tokens`);
                    } catch (e) {
                        console.error("[Ingest API] Failed to log telemetry", e);
                    }
                }
            } else {
                // Local Ollama (Llama 3.2 Vision 11B)
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 60000); // 60s timeout for larger 11b model

                const ollamaRes = await fetch("http://localhost:11434/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    signal: controller.signal,
                    body: JSON.stringify({
                        model: "llama3.2-vision:11b",
                        prompt: aiPrompt,
                        images: [base64Image],
                        stream: false,
                        format: "json",
                    }),
                });
                clearTimeout(timeoutId);

                if (ollamaRes.ok) {
                    const aiData = await ollamaRes.json();
                    responseText = aiData.response;
                } else {
                    throw new Error(`Ollama error status ${ollamaRes.status}`);
                }
            }

            // Parse responseText as JSON
            let parsed;
            try {
                // Sometime LLMs wrap json in \`\`\`json ... \`\`\`
                let cleanJson = responseText.trim();
                if (cleanJson.startsWith('\`\`\`json')) cleanJson = cleanJson.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
                if (cleanJson.startsWith('\`\`\`')) cleanJson = cleanJson.replace(/\`\`\`/g, '').trim();
                parsed = JSON.parse(cleanJson);
            } catch (e) {
                console.error("[Ingest API] Failed to parse AI JSON response:", responseText);
                throw e;
            }

            if (parsed.title) title = parsed.title;
            if (parsed.description) description = parsed.description;
            
            // Phase 11b: Store AI-generated tags as JSON string
            if (parsed.tags && Array.isArray(parsed.tags)) {
                // Normalize: lowercase, trim, deduplicate, limit to 8
                const normalizedTags = [...new Set(
                    parsed.tags
                        .map((t: any) => String(t).toLowerCase().trim())
                        .filter((t: string) => t.length > 0 && t.length < 50)
                )].slice(0, 8);
                if (normalizedTags.length > 0) {
                    tags = JSON.stringify(normalizedTags);
                }
            }

            // Map album Name to Album ID
            if (parsed.albumName) {
                const album = await prisma.album.findFirst({
                    where: { name: parsed.albumName }
                });
                
                if (album) {
                    albumId = album.id;
                } else {
                    console.warn(`[Ingest API] AI hallucinated unapproved album: ${parsed.albumName}`);
                }
            }
            console.log(`[Ingest API] ${aiMode} Analysis Success:`, parsed);
            
        } catch (aiError) {
            console.warn("[Ingest API] AI Inference Failed. Falling back to default metadata.", aiError);
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
                albumId,
                dominantColor,
                tags,
                technicalData,
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
