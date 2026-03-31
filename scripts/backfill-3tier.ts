/**
 * Backfill script: Generate 3-tier images (thumb 600px, display 2560px, original)
 * for all existing photos that only have the old 2-tier structure.
 *
 * This script is IDEMPOTENT — safe to run multiple times.
 * It skips photos that already have a displayUrl set.
 *
 * Usage:  npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/backfill-3tier.ts
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

        let processed = 0;
        let skipped = 0;
        let errors = 0;

        for (const photo of photos) {
            // Skip if already has a displayUrl (already backfilled)
            if (photo.displayUrl) {
                console.log(`  ✓ SKIP  ${photo.id} — already has displayUrl`);
                skipped++;
                continue;
            }

            // Determine the source file (prefer highRes original, fall back to url/thumb)
            const sourceUrl = photo.highResUrl || photo.url;
            const sourcePath = join(process.cwd(), 'public', sourceUrl);

            if (!(await fileExists(sourcePath))) {
                console.error(`  ✗ MISSING  ${photo.id} — source file not found: ${sourcePath}`);
                errors++;
                continue;
            }

            try {
                const buffer = await readFile(sourcePath);
                const metadata = await sharp(buffer).metadata();
                const originalWidth = metadata.width || 1080;
                const originalHeight = metadata.height || 1080;
                const aspectRatio = originalHeight / originalWidth;

                console.log(`  ↻ PROCESSING  ${photo.id}  (${originalWidth}×${originalHeight})`);

                // Generate display version (2560px max)
                const displayWidth = Math.min(originalWidth, DISPLAY_MAX_WIDTH);
                const displayHeight = Math.round(aspectRatio * displayWidth);
                const timestamp = Date.now();
                const safeId = photo.id.replace(/[^a-zA-Z0-9]/g, '');
                const displayFilename = `${timestamp}-display-${safeId}.jpg`;
                const displayFilepath = join(uploadDir, displayFilename);

                const displayBuffer = await sharp(buffer)
                    .resize(displayWidth, displayHeight, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 90 })
                    .toBuffer();
                await writeFile(displayFilepath, displayBuffer);

                // Generate new smaller thumbnail (600px max)
                const thumbWidth = Math.min(originalWidth, THUMB_MAX_WIDTH);
                const thumbHeight = Math.round(aspectRatio * thumbWidth);
                const thumbFilename = `${timestamp}-thumb-${safeId}.jpg`;
                const thumbFilepath = join(uploadDir, thumbFilename);

                const thumbBuffer = await sharp(buffer)
                    .resize(thumbWidth, thumbHeight, { fit: 'inside', withoutEnlargement: true })
                    .jpeg({ quality: 85 })
                    .toBuffer();
                await writeFile(thumbFilepath, thumbBuffer);

                // Update database with new URLs and display dimensions
                const displayUrl = `/uploads/${displayFilename}`;
                const newThumbUrl = `/uploads/${thumbFilename}`;

                await prisma.photo.update({
                    where: { id: photo.id },
                    data: {
                        url: newThumbUrl,
                        displayUrl,
                        width: displayWidth,
                        height: displayHeight,
                    },
                });

                const thumbSizeKB = Math.round(thumbBuffer.length / 1024);
                const displaySizeKB = Math.round(displayBuffer.length / 1024);
                console.log(`    → thumb: ${thumbWidth}×${thumbHeight} (${thumbSizeKB}KB)`);
                console.log(`    → display: ${displayWidth}×${displayHeight} (${displaySizeKB}KB)`);

                processed++;
            } catch (err: any) {
                console.error(`  ✗ ERROR  ${photo.id}: ${err.message}`);
                errors++;
            }
        }

        console.log(`\n${'═'.repeat(50)}`);
        console.log(`Done! Processed: ${processed}, Skipped: ${skipped}, Errors: ${errors}, Total: ${photos.length}`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
