import 'dotenv/config';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const TARGET_SIZE = 1080;

const PHOTOS = [
    {
        src: '/home/ub25ai/.gemini/antigravity/brain/4b98591c-1495-4b47-ae5f-7d92c06982a3/nebula_wide_1771892828211.png',
        title: 'Orion Nebula',
        description: 'Swirling purple and orange gas clouds of the Orion Nebula captured in stunning deep space astrophotography.',
    },
    {
        src: '/home/ub25ai/.gemini/antigravity/brain/4b98591c-1495-4b47-ae5f-7d92c06982a3/saturn_portrait_1771892841775.png',
        title: 'Saturn Close-Up',
        description: 'A detailed telescope photograph of Saturn showing its golden atmospheric bands and icy ring structure.',
    },
    {
        src: '/home/ub25ai/.gemini/antigravity/brain/4b98591c-1495-4b47-ae5f-7d92c06982a3/lunar_surface_1771892854806.png',
        title: 'Lunar Surface',
        description: 'High resolution view of the Moon highlighting dramatic crater shadows and mountain ranges.',
    },
    {
        src: '/home/ub25ai/.gemini/antigravity/brain/4b98591c-1495-4b47-ae5f-7d92c06982a3/milkyway_panorama_1771892870437.png',
        title: 'Milky Way Panorama',
        description: 'The Milky Way arching over a desert landscape with the vibrant galactic core on full display.',
    },
];

async function main() {
    const prisma = new PrismaClient();
    const uploadDir = join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });

    for (const photo of PHOTOS) {
        const buffer = await readFile(photo.src);
        const meta = await sharp(buffer).metadata();
        console.log(`  Source: ${photo.title}  (${meta.width}x${meta.height})`);

        // Resize to 1080x1080
        const resizedBuffer = await sharp(buffer)
            .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'cover' })
            .toBuffer();

        const filename = `${Date.now()}-${photo.title.replace(/\s+/g, '-').toLowerCase()}.png`;
        const filepath = join(uploadDir, filename);
        await writeFile(filepath, resizedBuffer);

        const url = `/uploads/${filename}`;
        await prisma.photo.create({
            data: {
                url,
                title: photo.title,
                description: photo.description,
                width: TARGET_SIZE,
                height: TARGET_SIZE,
            },
        });

        console.log(`  ✓ Saved: ${filename}  (${TARGET_SIZE}x${TARGET_SIZE})\n`);
        // Small delay so filenames are unique
        await new Promise(r => setTimeout(r, 50));
    }

    console.log('Done! 4 photos seeded.');
    await prisma.$disconnect();
}

main().catch(console.error);
