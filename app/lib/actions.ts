'use server'

import { revalidatePath } from 'next/cache'
import { join } from 'path'
import { writeFile, mkdir } from 'fs/promises'
import prisma from './prisma'

export async function createAlbum(formData: FormData) {
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    if (!name) throw new Error('Name is required')

    // Handle cover image upload if present
    let coverImage = null
    const file = formData.get('coverImage') as File

    if (file && file.size > 0) {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Ensure uploads directory exists
        const uploadDir = join(process.cwd(), 'public/uploads')
        await mkdir(uploadDir, { recursive: true })

        const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
        const filepath = join(uploadDir, filename)

        await writeFile(filepath, buffer)
        coverImage = `/uploads/${filename}`
    }

    await prisma.album.create({
        data: {
            name,
            description,
            coverImage,
        },
    })

    revalidatePath('/')
    revalidatePath('/albums')
}

export async function getAlbums() {
    const albums = await prisma.album.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            _count: {
                select: { photos: true },
            },
        },
    })
    return albums
}

export async function uploadPhoto(formData: FormData) {
    const file = formData.get('file') as File
    const albumId = formData.get('albumId') as string
    const title = formData.get('title') as string

    if (!file) throw new Error('No file uploaded')

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public/uploads')
    await mkdir(uploadDir, { recursive: true })

    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
    const filepath = join(uploadDir, filename)

    await writeFile(filepath, buffer)
    const url = `/uploads/${filename}`

    await prisma.photo.create({
        data: {
            url,
            title: title || file.name,
            albumId: albumId || null,
        },
    })

    if (albumId) {
        revalidatePath(`/albums/${albumId}`)
    }
    revalidatePath('/')
    return { success: true }
}

export async function getPhotos(albumId?: string) {
    if (albumId) {
        return prisma.photo.findMany({
            where: { albumId },
            orderBy: { createdAt: 'desc' },
        })
    }

    return prisma.photo.findMany({
        orderBy: { createdAt: 'desc' },
    })
}

export async function getAlbum(id: string) {
    return prisma.album.findUnique({
        where: { id },
    })
}
