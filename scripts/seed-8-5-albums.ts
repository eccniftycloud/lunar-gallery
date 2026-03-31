import 'dotenv/config';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

const predefinedAlbums = [
    { name: 'Solar System', path: '/home/ub25ai/.gemini/antigravity/brain/74b332d3-610d-4095-9f5e-57b914a43805/cover_solar_system_1774562547712.png' },
    { name: 'Moon', path: '/home/ub25ai/.gemini/antigravity/brain/74b332d3-610d-4095-9f5e-57b914a43805/cover_moon_1774562449926.png' },
    { name: 'Sun', path: '/home/ub25ai/.gemini/antigravity/brain/74b332d3-610d-4095-9f5e-57b914a43805/cover_sun_1774562462912.png' },
    { name: 'Galaxies', path: '/home/ub25ai/.gemini/antigravity/brain/74b332d3-610d-4095-9f5e-57b914a43805/cover_galaxies_1774562475309.png' },
    { name: 'Nebula', path: '/home/ub25ai/.gemini/antigravity/brain/74b332d3-610d-4095-9f5e-57b914a43805/cover_nebula_1774562488038.png' },
    { name: 'Superclusters', path: '/home/ub25ai/.gemini/antigravity/brain/74b332d3-610d-4095-9f5e-57b914a43805/cover_superclusters_1774562502591.png' },
    { name: 'Constellations', path: '/home/ub25ai/.gemini/antigravity/brain/74b332d3-610d-4095-9f5e-57b914a43805/cover_constellations_1774562516730.png' },
    { name: 'Comets', path: '/home/ub25ai/.gemini/antigravity/brain/74b332d3-610d-4095-9f5e-57b914a43805/cover_comets_1774562532611.png' }
];

async function main() {
    console.log('Starting Phase 8.5 Album Seeding...');
    const prisma = new PrismaClient();
    const uploadDir = join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });

    for (const albumData of predefinedAlbums) {
        // Read the AI generated cover
        const buf = await readFile(albumData.path);
        
        // Resize it to be an optimized cover thumb (1080x1080)
        const resized = await sharp(buf).resize(1080, 1080, { fit: 'cover' }).toBuffer();
        
        // Save to public assets
        const filename = `${Date.now()}-cover-${albumData.name.replace(/\s+/g, '-').toLowerCase()}.png`;
        await writeFile(join(uploadDir, filename), resized);
        const coverUrl = `/uploads/${filename}`;
        
        console.log(`Saved cover for ${albumData.name}: ${coverUrl}`);

        // See if album already exists
        const existing = await prisma.album.findFirst({
            where: { name: albumData.name }
        });

        if (existing) {
            await prisma.album.update({
                where: { id: existing.id },
                data: { coverImage: coverUrl }
            });
            console.log(`Updated ${albumData.name} album.`);
        } else {
            await prisma.album.create({
                data: {
                    name: albumData.name,
                    coverImage: coverUrl
                }
            });
            console.log(`Created ${albumData.name} album.`);
        }
    }
    
    // Optionally remove empty albums that aren't in this list
    const validNames = predefinedAlbums.map(a => a.name);
    const existingAlbums = await prisma.album.findMany({
        include: {
            _count: {
                select: { photos: true }
            }
        }
    });

    for (const al of existingAlbums) {
        if (!validNames.includes(al.name) && al._count.photos === 0) {
            await prisma.album.delete({ where: { id: al.id } });
            console.log(`Deleted empty unauthorized album: ${al.name}`);
        }
    }

    console.log('\\nPhase 8.5b and 8.5c completed successfully!');
    await prisma.$disconnect();
}

main().catch(console.error);
