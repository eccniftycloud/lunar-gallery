/**
 * Backfill script: Rotate Seestar S50 portrait photos to landscape
 * and regenerate all 3 tiers (thumb, display, original preserved).
 *
 * The Seestar S50 sensor (Sony IMX462) captures at 1920×1080 (16:9 landscape)
 * but the mount outputs 1080×1920 (portrait). This rotates them 90° clockwise
 * to their natural landscape orientation.
 *
 * IDEMPOTENT — skips photos where width > height (already landscape).
 * The original highres file is NEVER modified.
 *
 * Usage:  npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/backfill-rotate.ts
 */

import 'dotenv/config';
import { join } from 'path';
import { readFile, writeFile, access } from 'fs/promises';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const THUMB_MAX_WIDTH = 600;
const DISPLAY_MAX_WIDTH = 2560;

async function fileExists(filepath: string): Promise<boolean> {
    try {
        await access(filepath);
        return true;
    } catch {
        return false;
    }
}

async function main() {
    const prisma = new PrismaClient();
    const uploadDir = join(process.cwd(), 'public/uploads');

    try {
        const photos = await prisma.photo.findMany();
        console.log(`Found ${photos.length} photo(s) in the database.\n`);

        let rotated = 0;
        let skipped = 0;
        let errors = 0;

        for (const photo of photos) {
            // Read the source — use highres (original untouched) if available
            const sourceUrl = photo.highResUrl || photo.url;
            const sourcePath = join(process.cwd(), 'public', sourceUrl);

            if (!(await fileExists(sourcePath))) {
                console.error(`  ✗ MISSING  ${photo.id} — source not found: ${sourcePath}`);
                errors++;
                continue;
            }

            try {
                const buffer = await readFile(sourcePath);
                const metadata = await sharp(buffer).metadata();
                const origW = metadata.width || 0;
                const origH = metadata.height || 0;

                // Skip if already landscape or square
                if (origW >= origH) {
                    console.log(`  ✓ SKIP  ${photo.title || photo.id} — already landscape (${origW}×${origH})`);
                    skipped++;
                    continue;
                }

                // Only rotate Seestar-sized images (1080 wide portrait)
                if (origW !== 1080) {
                    console.log(`  ✓ SKIP  ${photo.title || photo.id} — not Seestar dimensions (${origW}×${origH})`);
                    skipped++;
                    continue;
                }

                console.log(`  ↻ ROTATING  "${photo.title || photo.id}"  (${origW}×${origH} → ${origH}×${origW})`);

                // Rotate 90° clockwise
                const rotatedBuffer = await sharp(buffer).rotate(90).toBuffer();
                const rotatedMeta = await sharp(rotatedBuffer).metadata();
                const newW = rotatedMeta.width || origH;
                const newH = rotatedMeta.height || origW;
                const aspectRatio = newH / newW;

                // Regenerate DISPLAY tier (2560px max)
                const displayWidth = Math.min(newW, DISPLAY_MAX_WIDTH);
                const displayHeight = Math.round(aspectRatio * displayWidth);
                const timestamp = Date.now();
                const safeId = photo.id.replace(/[^a-zA-Z0-9]/g, '');
                const displayFilename = `${timestamp}-display-rot-${safeId}.jpg`;
                const displayFilepath = join(uploadDir, displayFilename);

                const displayBuffer = await sharp(rotatedBuffer)
                    .resize(displayWidth, displayHeight, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 90 })
                    .toBuffer();
                await writeFile(displayFilepath, displayBuffer);

                // Regenerate THUMB tier (600px max)
                const thumbWidth = Math.min(newW, THUMB_MAX_WIDTH);
                const thumbHeight = Math.round(aspectRatio * thumbWidth);
                const thumbFilename = `${timestamp}-thumb-rot-${safeId}.jpg`;
                const thumbFilepath = join(uploadDir, thumbFilename);

                const thumbBuffer = await sharp(rotatedBuffer)
                    .resize(thumbWidth, thumbHeight, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 85 })
                    .toBuffer();
                await writeFile(thumbFilepath, thumbBuffer);

                // Update database — highResUrl stays untouched (original portrait)
                await prisma.photo.update({
                    where: { id: photo.id },
                    data: {
                        url: `/uploads/${thumbFilename}`,
                        displayUrl: `/uploads/${displayFilename}`,
                        width: displayWidth,
                        height: displayHeight,
                    },
                });

                const thumbKB = Math.round(thumbBuffer.length / 1024);
                const displayKB = Math.round(displayBuffer.length / 1024);
                console.log(`    → thumb: ${thumbWidth}×${thumbHeight} (${thumbKB}KB)`);
                console.log(`    → display: ${displayWidth}×${displayHeight} (${displayKB}KB)`);
                console.log(`    → highres: preserved original (${origW}×${origH})`);

                rotated++;
            } catch (err: any) {
                console.error(`  ✗ ERROR  ${photo.id}: ${err.message}`);
                errors++;
            }
        }

        console.log(`\n${'═'.repeat(50)}`);
        console.log(`Done! Rotated: ${rotated}, Skipped: ${skipped}, Errors: ${errors}, Total: ${photos.length}`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
