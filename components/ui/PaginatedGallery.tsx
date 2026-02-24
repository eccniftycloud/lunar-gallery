"use client";

import { useState, useEffect } from "react";
import PhotoCard from "./PhotoCard";
import { getPhotos } from "@/app/lib/actions";
import { Loader2 } from "lucide-react";

interface Photo {
    id: string;
    url: string;
    title: string | null;
    description: string | null;
    width: number | null;
    height: number | null;
    albumId: string | null;
}

interface Album {
    id: string;
    name: string;
}

interface PaginatedGalleryProps {
    initialPhotos: Photo[];
    albumId?: string;
    isAdmin: boolean;
    albums?: Album[];
}

export default function PaginatedGallery({ initialPhotos, albumId, isAdmin, albums }: PaginatedGalleryProps) {
    const [photos, setPhotos] = useState<Photo[]>(initialPhotos);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(initialPhotos.length === 20);

    const loadMore = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const nextPhotos = await getPhotos(albumId, page, 20);

            if (nextPhotos.length < 20) {
                setHasMore(false);
            }

            if (nextPhotos.length > 0) {
                setPhotos((prev) => [...prev, ...nextPhotos]);
                setPage((prev) => prev + 1);
            }
        } catch (error) {
            console.error("Failed to load more photos:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {photos.map((photo) => (
                    <PhotoCard
                        key={photo.id}
                        id={photo.id}
                        title={photo.title || undefined}
                        description={photo.description || undefined}
                        url={photo.url}
                        width={photo.width || undefined}
                        height={photo.height || undefined}
                        albumId={photo.albumId}
                        isAdmin={isAdmin}
                        albums={albums}
                    />
                ))}
            </div>

            {hasMore && (
                <div className="flex justify-center pt-8 pb-12">
                    <button
                        onClick={loadMore}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3 glass-panel hover:bg-white/10 text-white rounded-full transition-colors disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                        {loading ? "Loading..." : "Load More"}
                    </button>
                </div>
            )}
        </div>
    );
}
