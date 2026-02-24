'use server'

import { revalidatePath } from 'next/cache'
import { join } from 'path'
import { writeFile, mkdir, unlink } from 'fs/promises'
import prisma from './prisma'
import { signIn, auth } from '@/auth'
import { AuthError } from 'next-auth'
import { redirect } from 'next/navigation'
import sharp from 'sharp'
import bcrypt from 'bcryptjs'

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        await signIn('credentials', formData)
        // If signIn does not throw a redirect error, we manually redirect
        redirect('/')
    } catch (error) {
        if (error instanceof AuthError) {
            switch (error.type) {
                case 'CredentialsSignin':
                    return 'Invalid credentials.'
                default:
                    return 'Something went wrong.'
            }
        }
        throw error
    }
}

export async function changePassword(
    prevState: string | undefined,
    formData: FormData,
) {
    const session = await auth();
    if (!session?.user) return 'Unauthorized';

    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!currentPassword || !newPassword || !confirmPassword) {
        return 'All fields are required.';
    }

    if (newPassword.length < 6) {
        return 'New password must be at least 6 characters.';
    }

    if (newPassword !== confirmPassword) {
        return 'New passwords do not match.';
    }

    // Verify current password
    const adminConfig = await prisma.adminConfig.findUnique({
        where: { id: 'admin' },
    });

    let isCurrentValid = false;
    if (adminConfig) {
        isCurrentValid = await bcrypt.compare(currentPassword, adminConfig.password);
    } else {
        // Fallback to .env
        const envPassword = process.env.ADMIN_PASSWORD;
        isCurrentValid = currentPassword === envPassword;
    }

    if (!isCurrentValid) {
        return 'Current password is incorrect.';
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.adminConfig.upsert({
        where: { id: 'admin' },
        update: { password: hashedPassword },
        create: {
            id: 'admin',
            username: process.env.ADMIN_USERNAME || 'admin',
            password: hashedPassword,
        },
    });

    return 'success';
}


export async function createAlbum(formData: FormData) {
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

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
    const session = await auth();
    if (!session) throw new Error('Unauthorized');

    const file = formData.get('file') as File
    const albumId = formData.get('albumId') as string
    const title = formData.get('title') as string
    const description = formData.get('description') as string

    if (!file) throw new Error('No file uploaded')

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Ensure uploads directory exists
    const uploadDir = join(process.cwd(), 'public/uploads')
    await mkdir(uploadDir, { recursive: true })

    const filename = `${Date.now()}-${file.name.replace(/\s/g, '-')}`
    const filepath = join(uploadDir, filename)

    const resizedBuffer = await sharp(buffer)
        .resize(1080, 1080, { fit: 'cover' })
        .toBuffer()

    const width = 1080
    const height = 1080

    await writeFile(filepath, resizedBuffer)
    const url = `/uploads/${filename}`

    await prisma.photo.create({
        data: {
            url,
            title: title || file.name,
            description: description || null,
            albumId: albumId || null,
            width: width || null,
            height: height || null,
        },
    })

    if (albumId) {
        revalidatePath(`/albums/${albumId}`)
    }
    revalidatePath('/')
    return { success: true }
}

export async function getPhotos(albumId?: string, page: number = 0, limit: number = 20) {
    const skip = page * limit;

    if (albumId) {
        return prisma.photo.findMany({
            where: { albumId },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        })
    }

    return prisma.photo.findMany({
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
    })
}

export async function getAlbum(id: string) {
    return prisma.album.findUnique({
        where: { id },
    })
}

export async function deletePhoto(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new Error('Photo not found');

    // Delete file from disk
    try {
        const filepath = join(process.cwd(), 'public', photo.url);
        await unlink(filepath);
    } catch {
        // File may already be gone, continue with DB deletion
    }

    await prisma.photo.delete({ where: { id } });

    if (photo.albumId) {
        revalidatePath(`/albums/${photo.albumId}`);
    }
    revalidatePath('/');
    return { success: true };
}

export async function updatePhoto(
    id: string,
    data: { title?: string; description?: string },
) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const photo = await prisma.photo.update({
        where: { id },
        data: {
            title: data.title,
            description: data.description,
        },
    });

    if (photo.albumId) {
        revalidatePath(`/albums/${photo.albumId}`);
    }
    revalidatePath('/');
    return { success: true };
}

export async function movePhoto(id: string, albumId: string | null) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const photo = await prisma.photo.findUnique({ where: { id } });
    if (!photo) throw new Error('Photo not found');

    const oldAlbumId = photo.albumId;

    await prisma.photo.update({
        where: { id },
        data: { albumId: albumId || null },
    });

    // Revalidate old and new album pages
    if (oldAlbumId) revalidatePath(`/albums/${oldAlbumId}`);
    if (albumId) revalidatePath(`/albums/${albumId}`);
    revalidatePath('/');
    revalidatePath('/albums');
    return { success: true };
}

export async function getAdminConfig() {
    return prisma.adminConfig.findUnique({
        where: { id: 'admin' },
        select: {
            siteTitle: true
        }
    });
}

export async function updateSiteTitle(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const title = formData.get('title') as string;
    if (!title || title.trim().length === 0) {
        throw new Error('Title cannot be empty');
    }

    // We assume the admin config exists if we are logged in, but use upsert just in case
    await prisma.adminConfig.upsert({
        where: { id: 'admin' },
        update: { siteTitle: title },
        create: {
            id: 'admin',
            username: process.env.ADMIN_USERNAME || 'admin',
            // This is a weird case if we create it here without password, but it shouldn't happen 
            // if we are logged in as admin. We'll use a placeholder.
            password: 'placeholder_hash_should_not_happen',
            siteTitle: title
        }
    });

    revalidatePath('/', 'layout');
    return { success: true };
}
