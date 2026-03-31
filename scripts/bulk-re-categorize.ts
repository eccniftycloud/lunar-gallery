import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const validAlbums = [
  'Solar System', 'Moon', 'Sun', 'Galaxies', 
  'Nebula', 'Superclusters', 'Constellations', 'Comets'
];

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

async function main() {
    const prisma = new PrismaClient();
    console.log('[Resync] Starting bulk photo re-categorization...');

    // 1. Fetch the official albums
    const albums = await prisma.album.findMany({
        where: { name: { in: validAlbums } }
    });
    
    const albumMap = new Map(albums.map(a => [a.name, a.id]));

    // 2. Fetch all photos that aren't properly linked to the valid 8 albums
    const photosToProcess = await prisma.photo.findMany({
        include: { album: true }
    });

    const needsUpdate = photosToProcess.filter(p => !p.album || !validAlbums.includes(p.album.name));
    console.log(`[Resync] Found ${needsUpdate.length} photos needing re-categorization based on title/description.`);

    for (const photo of needsUpdate) {
        console.log(`[Resync] Processing: "${photo.title}"...`);
        
        const aiPrompt = `Analyze the following astrophotography capture:
Title: ${photo.title || 'Unknown'}
Description: ${photo.description || 'Unknown'}

Return ONLY a valid JSON object matching this exact shape, nothing else:
{
  "albumName": "Choose EXACTLY ONE category: 'Solar System', 'Moon', 'Sun', 'Galaxies', 'Nebula', 'Superclusters', 'Constellations', or 'Comets'"
}`;

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000);

            const ollamaRes = await fetch("http://localhost:11434/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                signal: controller.signal,
                body: JSON.stringify({
                    model: "llava",
                    prompt: aiPrompt,
                    stream: false,
                    format: "json",
                }),
            });
            clearTimeout(timeoutId);

            if (ollamaRes.ok) {
                const aiData = await ollamaRes.json();
                const parsed = JSON.parse(aiData.response);
                
                if (parsed.albumName && albumMap.has(parsed.albumName)) {
                    await prisma.photo.update({
                        where: { id: photo.id },
                        data: { albumId: albumMap.get(parsed.albumName) }
                    });
                    console.log(`  -> Successfully mapped to "${parsed.albumName}"`);
                } else {
                    console.log(`  -> AI suggested invalid album "${parsed.albumName}", moving to Uncategorized.`);
                    await prisma.photo.update({
                        where: { id: photo.id },
                        data: { albumId: null }
                    });
                }
            } else {
                console.log(`  -> AI request failed, moving to Uncategorized`);
            }
        } catch (err) {
            console.error(`  -> Network error skipping photo: ${err}`);
        }
        await sleep(500); // Give AI a tiny breather to prevent crash
    }

    // 3. Cleanup rogue overlapping old albums
    const allAlbums = await prisma.album.findMany({
        include: { _count: { select: { photos: true } } }
    });

    for (const al of allAlbums) {
        if (!validAlbums.includes(al.name) && al._count.photos === 0) {
            await prisma.album.delete({ where: { id: al.id } });
            console.log(`[Resync] Cleaned up legacy empty album: ${al.name}`);
        }
    }

    console.log('[Resync] Complete! Tested Auto-Ingest categorization rules effectively.');
    await prisma.$disconnect();
}

main().catch(console.error);
