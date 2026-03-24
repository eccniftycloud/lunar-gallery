/**
 * Backfill Script — Populate width/height for photos missing dimensions.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' scripts/backfill-dimensions.ts
 *
 * What it does:
 *   1. Finds all photos in the database where width OR height is NULL.
 *   2. Reads the actual image file from disk using Sharp.
 *   3. Updates the database record with the real pixel dimensions.
 *
 * Safe to run multiple times — it only touches photos with missing data.
 */

import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import sharp from 'sharp';
import { join } from 'path';
import { existsSync } from 'fs';

const prisma = new PrismaClient();

async function backfillDimensions() {
    console.log('🔭 Backfill Script — Scanning for photos with missing dimensions...\n');

    // Find all photos where width or height is NULL
    const photos = await prisma.photo.findMany({
        where: {
            OR: [
                { width: null },
                { height: null },
            ],
        },
    });

    if (photos.length === 0) {
        console.log('✅ All photos already have dimensions. Nothing to backfill!');
        return;
    }

    console.log(`📸 Found ${photos.length} photo(s) missing dimensions.\n`);

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const photo of photos) {
        const filepath = join(process.cwd(), 'public', photo.url);

        // Check if the file actually exists on disk
        if (!existsSync(filepath)) {
            console.log(`  ⚠️  SKIP: "${photo.title}" — file not found at ${photo.url}`);
            skipped++;
            continue;
        }

        try {
            // Use Sharp to read the actual image dimensions
            const metadata = await sharp(filepath).metadata();

            if (!metadata.width || !metadata.height) {
                console.log(`  ⚠️  SKIP: "${photo.title}" — Sharp could not read dimensions`);
                skipped++;
                continue;
            }

            // Update the database record
            await prisma.photo.update({
                where: { id: photo.id },
                data: {
                    width: metadata.width,
                    height: metadata.height,
                },
            });

            console.log(`  ✅ "${photo.title}" → ${metadata.width}x${metadata.height}`);
            updated++;
        } catch (err) {
            console.log(`  ❌ ERROR: "${photo.title}" — ${(err as Error).message}`);
            errors++;
        }
    }

    console.log('\n--- Backfill Summary ---');
    console.log(`  Updated: ${updated}`);
    console.log(`  Skipped: ${skipped}`);
    console.log(`  Errors:  ${errors}`);
    console.log(`  Total:   ${photos.length}`);
}

backfillDimensions()
    .catch((err) => {
        console.error('❌ Fatal error:', err);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
