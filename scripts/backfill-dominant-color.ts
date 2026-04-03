/**
 * backfill-dominant-color.ts
 * 
 * Phase 10d — Retroactively extract dominant color from existing thumbnails
 * and store the hex value in the database for cosmic skeleton tinting.
 * 
 * Usage:
 *   npx tsx scripts/backfill-dominant-color.ts
 * 
 * Idempotent: skips photos that already have a dominantColor value.
 */

import { PrismaClient } from "@prisma/client";
import sharp from "sharp";
import { join } from "path";
import { existsSync } from "fs";

const prisma = new PrismaClient();

async function main() {
    const photos = await prisma.photo.findMany({
        where: { dominantColor: null },
    });

    console.log(`[Backfill] Found ${photos.length} photos without a dominant color.\n`);

    let updated = 0;
    let skipped = 0;

    for (const photo of photos) {
        const thumbPath = join(process.cwd(), "public", photo.url);

        if (!existsSync(thumbPath)) {
            console.log(`  ⚠ Skipping "${photo.title || photo.id}" — thumbnail not found: ${photo.url}`);
            skipped++;
            continue;
        }

        try {
            const { dominant } = await sharp(thumbPath).stats();
            const hex = `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`;

            await prisma.photo.update({
                where: { id: photo.id },
                data: { dominantColor: hex },
            });

            console.log(`  ✅ ${photo.title || photo.id} → ${hex}`);
            updated++;
        } catch (err) {
            console.error(`  ❌ Error processing "${photo.title || photo.id}":`, err);
            skipped++;
        }
    }

    console.log(`\n[Backfill] Done! Updated: ${updated}, Skipped: ${skipped}`);
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
