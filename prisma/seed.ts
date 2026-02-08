import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Clear existing data
    await prisma.photo.deleteMany()
    await prisma.album.deleteMany()

    const albums = [
        {
            name: 'Constellations',
            description: 'The patterns in the night sky that guide us.',
            coverImage: 'https://images.unsplash.com/photo-1519681393798-3828fb409129?auto=format&fit=crop&w=800&q=80',
            photos: [
                { url: 'https://images.unsplash.com/photo-1519681393798-3828fb409129?auto=format&fit=crop&w=1200&q=80', title: 'Orion' },
                { url: 'https://images.unsplash.com/photo-1543722530-d184463519b3?auto=format&fit=crop&w=1200&q=80', title: 'Ursa Major' },
                { url: 'https://images.unsplash.com/photo-1534233650905-52b49516b225?auto=format&fit=crop&w=1200&q=80', title: 'Cassiopeia' },
                { url: 'https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?auto=format&fit=crop&w=1200&q=80', title: 'Scorpius' },
            ],
        },
        {
            name: 'Galaxies',
            description: 'Islands of stars drifting in the cosmic ocean.',
            coverImage: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=800&q=80',
            photos: [
                { url: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&fit=crop&w=1200&q=80', title: 'Andromeda' },
                { url: 'https://images.unsplash.com/photo-1614730341194-75c60740a070?auto=format&fit=crop&w=1200&q=80', title: 'Sombrero Galaxy' },
                { url: 'https://images.unsplash.com/photo-1444703686981-a3abbc4d4fe3?auto=format&fit=crop&w=1200&q=80', title: 'Milky Way Core' },
                { url: 'https://images.unsplash.com/photo-1506318137071-a8bcbf6dd041?auto=format&fit=crop&w=1200&q=80', title: 'Triangulum' },
            ],
        },
        {
            name: 'Nebula',
            description: 'Stellar nurseries and remnants of dead stars.',
            coverImage: 'https://images.unsplash.com/photo-1563242152-87a3cb377583?auto=format&fit=crop&w=800&q=80',
            photos: [
                { url: 'https://images.unsplash.com/photo-1563242152-87a3cb377583?auto=format&fit=crop&w=1200&q=80', title: 'Orion Nebula' },
                { url: 'https://images.unsplash.com/photo-1541873676-a18131494184?auto=format&fit=crop&w=1200&q=80', title: 'Horsehead Nebula' },
                { url: 'https://images.unsplash.com/photo-1522030299830-16b8d3d049fe?auto=format&fit=crop&w=1200&q=80', title: 'Carina Nebula' },
                { url: 'https://images.unsplash.com/photo-1484589065579-248aad0d8b13?auto=format&fit=crop&w=1200&q=80', title: 'Crab Nebula' },
            ],
        },
    ]

    for (const albumData of albums) {
        const { photos, ...albumInfo } = albumData
        const album = await prisma.album.create({
            data: albumInfo,
        })

        for (const photo of photos) {
            await prisma.photo.create({
                data: {
                    ...photo,
                    albumId: album.id,
                },
            })
        }
    }

    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
