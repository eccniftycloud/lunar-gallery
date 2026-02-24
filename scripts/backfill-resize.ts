/**
 * Backfill script: Resize all existing photos to 1080x1080 and update DB records.
 *
 * Usage:  npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/backfill-resize.ts
 */

import 'dotenv/config';
import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const TARGET_SIZE = 1080;

async function main() {
    const prisma = new PrismaClient();

    try {
        const photos = await prisma.photo.findMany();
        console.log(`Found ${photos.length} photo(s) in the database.\n`);

        let resized = 0;
        let skipped = 0;

        for (const photo of photos) {
            const filepath = join(process.cwd(), 'public', photo.url);

            try {
                const buffer = await readFile(filepath);
                const metadata = await sharp(buffer).metadata();
                const currentW = metadata.width ?? 0;
                const currentH = metadata.height ?? 0;

                // Skip if already the target size
                if (currentW === TARGET_SIZE && currentH === TARGET_SIZE) {
                    console.log(`  ✓ SKIP  ${photo.url}  (already ${TARGET_SIZE}x${TARGET_SIZE})`);
                    skipped++;
                    continue;
                }

                console.log(`  ↻ RESIZE  ${photo.url}  (${currentW}x${currentH} → ${TARGET_SIZE}x${TARGET_SIZE})`);

                const resizedBuffer = await sharp(buffer)
                    .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'cover' })
                    .toBuffer();

                await writeFile(filepath, resizedBuffer);

                // Update DB record
                await prisma.photo.update({
                    where: { id: photo.id },
                    data: { width: TARGET_SIZE, height: TARGET_SIZE },
                });

                resized++;
            } catch (err: any) {
                console.error(`  ✗ ERROR  ${photo.url}: ${err.message}`);
            }
        }

        console.log(`\nDone! Resized: ${resized}, Skipped: ${skipped}, Total: ${photos.length}`);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(console.error);
