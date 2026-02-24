import 'dotenv/config';
import { join } from 'path';
import { readFile, writeFile, mkdir } from 'fs/promises';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    const uploadDir = join(process.cwd(), 'public/uploads');
    await mkdir(uploadDir, { recursive: true });

    // 1. Resize and save solar system cover
    const solarBuf = await readFile('/home/ub25ai/.gemini/antigravity/brain/4b98591c-1495-4b47-ae5f-7d92c06982a3/solar_system_cover_1771905166745.png');
    const solarResized = await sharp(solarBuf).resize(1080, 1080, { fit: 'cover' }).toBuffer();
    const solarFilename = `${Date.now()}-solar-system-cover.png`;
    await writeFile(join(uploadDir, solarFilename), solarResized);
    const solarCoverUrl = `/uploads/${solarFilename}`;
    console.log('Solar system cover saved:', solarCoverUrl);

    // 2. Resize and save constellation cover
    const constBuf = await readFile('/home/ub25ai/.gemini/antigravity/brain/4b98591c-1495-4b47-ae5f-7d92c06982a3/constellation_cover_1771905182655.png');
    const constResized = await sharp(constBuf).resize(1080, 1080, { fit: 'cover' }).toBuffer();
    const constFilename = `${Date.now()}-constellation-cover.png`;
    await writeFile(join(uploadDir, constFilename), constResized);
    const constCoverUrl = `/uploads/${constFilename}`;
    console.log('Constellation cover saved:', constCoverUrl);

    // 3. Create "Solar System" album with solar system cover
    const solarAlbum = await prisma.album.create({
        data: {
            name: 'Solar System',
            description: 'Our celestial neighborhood — the Sun, planets, moons, and everything in between.',
            coverImage: solarCoverUrl,
        }
    });
    console.log('Created Solar System album:', solarAlbum.id);

    // 4. Move Lunar Surface photo to Solar System album
    const lunarPhoto = await prisma.photo.findFirst({ where: { title: 'Lunar Surface' } });
    if (lunarPhoto) {
        const oldAlbumId = lunarPhoto.albumId;
        await prisma.photo.update({
            where: { id: lunarPhoto.id },
            data: { albumId: solarAlbum.id }
        });
        console.log('Moved Lunar Surface to Solar System album');

        // Update old album (Constellations) cover since we removed its photo
        if (oldAlbumId) {
            // Set constellations cover to the new constellation image
            await prisma.album.update({
                where: { id: oldAlbumId },
                data: { coverImage: constCoverUrl }
            });
            console.log('Updated Constellations cover to constellation image');
        }
    }

    // 5. Also move Saturn to Solar System
    const saturnPhoto = await prisma.photo.findFirst({ where: { title: 'Saturn Close-Up' } });
    if (saturnPhoto) {
        await prisma.photo.update({
            where: { id: saturnPhoto.id },
            data: { albumId: solarAlbum.id }
        });
        console.log('Moved Saturn Close-Up to Solar System album');
    }

    console.log('\nDone!');
    await prisma.$disconnect();
}

main().catch(console.error);
