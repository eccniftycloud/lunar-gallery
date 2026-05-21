import { PrismaClient } from "@prisma/client";
import { join } from "path";
import { readFile } from "fs/promises";
import sharp from "sharp";
import exifr from "exifr";
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";
import * as dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();
const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION || "us-east-1" });

async function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

// Ensure parallel execution limit
async function asyncPool(poolLimit: number, array: any[], iteratorFn: (item: any) => Promise<any>) {
    const ret = [];
    const executing: Promise<any>[] = [];
    for (const item of array) {
        const p = Promise.resolve().then(() => iteratorFn(item));
        ret.push(p);
        if (poolLimit <= array.length) {
            const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
            executing.push(e);
            if (executing.length >= poolLimit) {
                await Promise.race(executing);
            }
        }
    }
    return Promise.all(ret);
}

const aiPromptTemplate = `You are an expert astrophotographer and astronomer analyzing a telescope or camera capture. Study this image carefully.{EXIF_CONTEXT}

Return ONLY a valid JSON object matching this EXACT schema — no markdown, no commentary:
{
  "title": "A precise 2-6 word title using the object's common AND catalog name when identifiable (e.g. 'M42 — Orion Nebula', 'NGC 7000 — North America Nebula', 'Waxing Gibbous Moon', 'Jupiter & Galilean Moons'). If a specific deep-sky object is ambiguous, describe what is seen.",
  "description": "A rich 2-4 sentence description. Include: (1) what the object IS astronomically (type, classification), (2) its approximate distance or angular size if known, (3) the constellation it resides in if applicable, (4) any notable visual features visible in this specific capture (e.g. dust lanes, spiral arms, craters, prominences, color regions).",
  "albumName": "Choose EXACTLY ONE: 'Solar System', 'Moon', 'Sun', 'Galaxies', 'Nebula', 'Superclusters', 'Constellations', or 'Comets'",
  "tags": ["3 to 8 descriptive tags as an array of lowercase strings — include object type (e.g. 'emission nebula', 'spiral galaxy', 'lunar crater'), visual characteristics (e.g. 'colorful', 'wide-field', 'high-detail'), and relevant identifiers (e.g. 'messier object', 'ngc catalog', 'planetary')"]
}`;

async function processPhoto(photo: any) {
    console.log(`\n⏳ Processing photo ID: ${photo.id} (${photo.title})`);
    
    // Choose the best quality picture available for EXIF details
    const fileUrl = photo.highResUrl || photo.displayUrl || photo.url;
    if (!fileUrl) {
        console.warn(`⚠️ No valid URL for photo ID ${photo.id}. Skipping.`);
        return;
    }
    
    // Extract file path properly (e.g., /uploads/filename.jpg -> public/uploads/filename.jpg)
    const filePath = join(process.cwd(), "public", fileUrl);

    try {
        const buffer = await readFile(filePath);
        const metadata = await sharp(buffer).metadata();
        const originalWidth = metadata.width || 1080;
        const originalHeight = metadata.height || 1080;
        const aspectRatio = originalHeight / originalWidth;
        
        let thumbBuffer;
        try {
            thumbBuffer = await sharp(buffer)
                .resize(600, Math.round(aspectRatio * 600), { fit: "inside", withoutEnlargement: true })
                .jpeg({ quality: 85 })
                .toBuffer();
        } catch (e) {
            console.error(`❌ Failed to resize thumb for ${photo.id}`, e);
            return;
        }

        let parsedExif: any = null;
        let technicalData: string | null = null;
        let exifContext = "";

        try {
            // Attempt EXIF read
            parsedExif = await exifr.parse(buffer, { gps: false, tiff: true, exif: true, iptc: true, xmp: true });
            
            if (parsedExif) {
                const techSpecs: Record<string, any> = {};
                if (parsedExif.Make) techSpecs.make = parsedExif.Make;
                if (parsedExif.Model) techSpecs.model = parsedExif.Model;
                if (parsedExif.Software) techSpecs.software = parsedExif.Software;
                if (parsedExif.DateTimeOriginal) {
                    techSpecs.captureDate = parsedExif.DateTimeOriginal instanceof Date
                        ? parsedExif.DateTimeOriginal.toISOString()
                        : String(parsedExif.DateTimeOriginal);
                }
                if (parsedExif.ExposureTime != null) {
                    const expTime = parsedExif.ExposureTime;
                    techSpecs.exposureTime = expTime < 1 ? `1/${Math.round(1 / expTime)}s` : `${expTime}s`;
                    techSpecs.exposureTimeRaw = expTime;
                }
                if (parsedExif.ISO != null) techSpecs.iso = parsedExif.ISO;
                if (parsedExif.ISOSpeedRatings != null) techSpecs.iso = parsedExif.ISOSpeedRatings;
                if (parsedExif.FNumber != null) techSpecs.fNumber = `f/${parsedExif.FNumber}`;
                if (parsedExif.FocalLength != null) techSpecs.focalLength = `${parsedExif.FocalLength}mm`;
                if (parsedExif.Gain != null) techSpecs.gain = parsedExif.Gain;
                if (parsedExif.Temperature != null) techSpecs.sensorTemp = `${parsedExif.Temperature}°C`;
                if (parsedExif.SensorTemperature != null) techSpecs.sensorTemp = `${parsedExif.SensorTemperature}°C`;
                if (parsedExif.CCDTemperature != null) techSpecs.sensorTemp = `${parsedExif.CCDTemperature}°C`;
                if (parsedExif.FrameCount != null) techSpecs.frameCount = parsedExif.FrameCount;
                if (parsedExif.StackCount != null) techSpecs.stackCount = parsedExif.StackCount;
                techSpecs.resolution = `${originalWidth}×${originalHeight}`;
                if (parsedExif.ImageDescription) techSpecs.imageDescription = parsedExif.ImageDescription;
                if (parsedExif.UserComment) techSpecs.userComment = parsedExif.UserComment;
                if (parsedExif.Subject) techSpecs.subject = parsedExif.Subject;

                if (Object.keys(techSpecs).length > 1) {
                    technicalData = JSON.stringify(techSpecs);
                }

                // AI Context
                const keysToKeep = [
                    "Make", "Model", "Software", "DateTimeOriginal",
                    "UserComment", "ImageDescription", "Subject", "Title",
                    "ExposureTime", "ISO", "ISOSpeedRatings", "FocalLength",
                    "FNumber", "Gain", "Temperature", "FrameCount"
                ];
                const relevantData = Object.entries(parsedExif).filter(([key, value]) => {
                    return keysToKeep.includes(key) || (typeof value === "string" && value.length > 2);
                }).slice(0, 15);

                if (relevantData.length > 0) {
                    const metadataPayload = Object.fromEntries(relevantData);
                    exifContext = `\n\nCRITICAL CONTEXT FROM EMBEDDED TELESCOPE/CAMERA METADATA:\n${JSON.stringify(metadataPayload, null, 2)}\n\nUse this exact metadata to confidently identify the celestial object, correct its name, reference its catalog designation, and determine its album category.`;
                }
            }
        } catch (e) {
            // Ignore exif failure
        }

        const aiPrompt = aiPromptTemplate.replace("{EXIF_CONTEXT}", exifContext);
        const base64Image = thumbBuffer.toString("base64");

        const payload = {
            anthropic_version: "bedrock-2023-05-31",
            max_tokens: 1024,
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "image", source: { type: "base64", media_type: "image/jpeg", data: base64Image } },
                        { type: "text", text: aiPrompt }
                    ]
                }
            ]
        };

        const command = new InvokeModelCommand({
            contentType: "application/json",
            body: JSON.stringify(payload),
            modelId: "anthropic.claude-3-haiku-20240307-v1:0"
        });

        const response = await bedrock.send(command);
        const decodedResponseBody = new TextDecoder().decode(response.body);
        const aiData = JSON.parse(decodedResponseBody);
        const responseText = aiData.content[0].text;

        if (aiData.usage) {
            await prisma.adminConfig.update({
                where: { id: "admin" },
                data: {
                    bedrockInputTokens: { increment: aiData.usage.input_tokens || 0 },
                    bedrockOutputTokens: { increment: aiData.usage.output_tokens || 0 }
                }
            }).catch(() => {});
        }

        let parsed;
        try {
            let cleanJson = responseText.trim();
            if (cleanJson.startsWith('\`\`\`json')) cleanJson = cleanJson.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
            if (cleanJson.startsWith('\`\`\`')) cleanJson = cleanJson.replace(/\`\`\`/g, '').trim();
            parsed = JSON.parse(cleanJson);
        } catch (e) {
            console.error(`❌ Failed to parse JSON for photo ${photo.id}`);
            return;
        }

        let tags: string | null = null;
        if (parsed.tags && Array.isArray(parsed.tags)) {
            const normalizedTags = [...new Set(
                parsed.tags
                    .map((t: any) => String(t).toLowerCase().trim())
                    .filter((t: string) => t.length > 0 && t.length < 50)
            )].slice(0, 8);
            if (normalizedTags.length > 0) {
                tags = JSON.stringify(normalizedTags);
            }
        }

        let albumId = photo.albumId;
        if (parsed.albumName) {
            const album = await prisma.album.findFirst({ where: { name: parsed.albumName } });
            if (album) albumId = album.id;
        }

        await prisma.photo.update({
            where: { id: photo.id },
            data: {
                title: parsed.title || photo.title,
                description: parsed.description || photo.description,
                tags,
                technicalData,
                albumId
            }
        });

        console.log(`✅ Updated ${photo.id} -> "${parsed.title}"`);
        
        // Wait a small bit between AWS calls to prevent rate limits
        await sleep(500);

    } catch (error) {
        console.error(`❌ Error backfilling photo ${photo.id}:`, error);
    }
}

async function main() {
    console.log("🚀 Starting Phase 11 Backfill Script...");
    
    const photos = await prisma.photo.findMany();
    // Exclude the 3 test images we just created to be safe, or just run on all older images.
    // Assuming you want to run on everything, we'll run on all.
    console.log(`Found ${photos.length} photos. Processing with Bedrock (5 concurrency)...`);

    await asyncPool(5, photos, processPhoto);

    console.log("🎉 Backfill complete!");
    process.exit(0);
}

main().catch(console.error);
