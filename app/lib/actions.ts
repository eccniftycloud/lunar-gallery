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
import { uploadLimiter, loginLimiter } from './rate-limit'

export async function authenticate(
    prevState: string | undefined,
    formData: FormData,
) {
    try {
        loginLimiter.check('admin');
    } catch {
        return 'Too many login attempts. Please wait 60 seconds.';
    }

    try {
        await signIn('credentials', formData)
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

    uploadLimiter.check('admin');

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

    const safeFilename = file.name.replace(/\s/g, '-')
    const timestamp = Date.now()
    const thumbFilename = `${timestamp}-thumb-${safeFilename}`
    const displayFilename = `${timestamp}-display-${safeFilename}`
    const highResFilename = `${timestamp}-highres-${safeFilename}`

    const thumbFilepath = join(uploadDir, thumbFilename)
    const displayFilepath = join(uploadDir, displayFilename)
    const highResFilepath = join(uploadDir, highResFilename)

    const metadata = await sharp(buffer).metadata()
    const originalWidth = metadata.width || 1080
    const originalHeight = metadata.height || 1080
    const aspectRatio = originalHeight / originalWidth

    // TIER 1: Thumbnail (600px max) — masonry grid cards
    const thumbWidth = Math.min(originalWidth, 600)
    const thumbHeight = Math.round(aspectRatio * thumbWidth)

    // TIER 2: Display (2560px max) — lightbox viewing
    const displayWidth = Math.min(originalWidth, 2560)
    const displayHeight = Math.round(aspectRatio * displayWidth)

    // A) Preserve untouched original (TIER 3)
    await writeFile(highResFilepath, buffer)

    // B) Display version for lightbox (TIER 2)
    const displayBuffer = await sharp(buffer)
        .resize(displayWidth, displayHeight, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 90 })
        .toBuffer()
    await writeFile(displayFilepath, displayBuffer)

    // C) Small thumbnail for masonry grids (TIER 1)
    const resizedBuffer = await sharp(buffer)
        .resize(thumbWidth, thumbHeight, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 85 })
        .toBuffer()
    await writeFile(thumbFilepath, resizedBuffer)

    const url = `/uploads/${thumbFilename}`
    const displayUrl = `/uploads/${displayFilename}`
    const highResUrl = `/uploads/${highResFilename}`

    // Extract dominant color for cosmic skeleton tinting (Phase 10d)
    let dominantColor: string | null = null;
    try {
        const { dominant } = await sharp(resizedBuffer).stats();
        dominantColor = `#${dominant.r.toString(16).padStart(2, '0')}${dominant.g.toString(16).padStart(2, '0')}${dominant.b.toString(16).padStart(2, '0')}`;
    } catch {
        // Non-critical — skeleton will fall back to default nebula shimmer
    }

    await prisma.photo.create({
        data: {
            url,
            displayUrl,
            highResUrl,
            title: title || file.name,
            description: description || null,
            albumId: albumId || null,
            width: displayWidth,
            height: displayHeight,
            dominantColor,
        },
    })

    if (albumId) {
        revalidatePath(`/albums/${albumId}`)
    }
    revalidatePath('/')
    return { success: true }
}

export type SortOption = 'newest' | 'oldest' | 'name';

export async function getPhotos(albumId?: string, page: number = 0, limit: number = 20, sortBy: SortOption = 'newest') {
    const skip = page * limit;

    const orderBy = sortBy === 'oldest'
        ? { createdAt: 'asc' as const }
        : sortBy === 'name'
            ? { title: 'asc' as const }
            : { createdAt: 'desc' as const };

    if (albumId) {
        return prisma.photo.findMany({
            where: { albumId },
            orderBy,
            skip,
            take: limit,
        })
    }

    return prisma.photo.findMany({
        orderBy,
        skip,
        take: limit,
    })
}

export async function searchPhotos(query: string, albumId?: string) {
    if (!query || query.trim().length === 0) {
        return getPhotos(albumId, 0, 100);
    }

    const searchTerm = `%${query}%`;

    if (albumId) {
        return prisma.$queryRawUnsafe(
            `SELECT id, url, displayUrl, highResUrl, title, description, width, height, albumId, createdAt
             FROM Photo
             WHERE albumId = ? AND (title LIKE ? OR description LIKE ?)
             ORDER BY createdAt DESC
             LIMIT 100`,
            albumId, searchTerm, searchTerm
        );
    }

    return prisma.$queryRawUnsafe(
        `SELECT id, url, displayUrl, highResUrl, title, description, width, height, albumId, createdAt
         FROM Photo
         WHERE title LIKE ? OR description LIKE ?
         ORDER BY createdAt DESC
         LIMIT 100`,
        searchTerm, searchTerm
    );
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

// ============================================
// Event Actions (Phase 10f: Current Events)
// ============================================

export async function getActiveEvents() {
    return prisma.event.findMany({
        where: { active: true },
        orderBy: { eventDate: 'desc' },
        take: 4,
    });
}

export async function getAllEvents() {
    return prisma.event.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function createEvent(formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const imageUrl = formData.get('imageUrl') as string;
    const externalUrl = formData.get('externalUrl') as string;
    const eventDateStr = formData.get('eventDate') as string;

    if (!title) throw new Error('Title is required');

    // Handle optional image upload
    let finalImageUrl = imageUrl || null;
    const file = formData.get('imageFile') as File;
    if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });
        const filename = `${Date.now()}-event-${file.name.replace(/\s/g, '-')}`;
        const filepath = join(uploadDir, filename);

        // Resize to a reasonable card size
        const resizedBuffer = await sharp(buffer)
            .resize(800, 600, { fit: 'cover', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        await writeFile(filepath, resizedBuffer);
        finalImageUrl = `/uploads/${filename}`;
    }

    await prisma.event.create({
        data: {
            title,
            description: description || null,
            imageUrl: finalImageUrl,
            externalUrl: externalUrl || null,
            eventDate: eventDateStr ? new Date(eventDateStr) : null,
        },
    });

    revalidatePath('/');
    revalidatePath('/settings');
    return { success: true };
}

export async function updateEvent(id: string, formData: FormData) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const externalUrl = formData.get('externalUrl') as string;
    const eventDateStr = formData.get('eventDate') as string;

    if (!title) throw new Error('Title is required');

    // Handle optional image upload
    let imageUrl: string | undefined = undefined;
    const file = formData.get('imageFile') as File;
    if (file && file.size > 0) {
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const uploadDir = join(process.cwd(), 'public/uploads');
        await mkdir(uploadDir, { recursive: true });
        const filename = `${Date.now()}-event-${file.name.replace(/\s/g, '-')}`;
        const filepath = join(uploadDir, filename);

        const resizedBuffer = await sharp(buffer)
            .resize(800, 600, { fit: 'cover', withoutEnlargement: true })
            .jpeg({ quality: 85 })
            .toBuffer();
        await writeFile(filepath, resizedBuffer);
        imageUrl = `/uploads/${filename}`;
    }

    await prisma.event.update({
        where: { id },
        data: {
            title,
            description: description || null,
            ...(imageUrl && { imageUrl }),
            externalUrl: externalUrl || null,
            eventDate: eventDateStr ? new Date(eventDateStr) : null,
        },
    });

    revalidatePath('/');
    revalidatePath('/settings');
    return { success: true };
}

export async function toggleEvent(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    const event = await prisma.event.findUnique({ where: { id } });
    if (!event) throw new Error('Event not found');

    await prisma.event.update({
        where: { id },
        data: { active: !event.active },
    });

    revalidatePath('/');
    revalidatePath('/settings');
    return { success: true };
}

export async function deleteEvent(id: string) {
    const session = await auth();
    if (!session?.user) throw new Error('Unauthorized');

    await prisma.event.delete({ where: { id } });

    revalidatePath('/');
    revalidatePath('/settings');
    return { success: true };
}
