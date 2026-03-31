"use client";

import { useState } from "react";
import PhotoCard from "./PhotoCard";
import SortControl from "./SortControl";
import { GallerySkeletonGrid } from "./Skeletons";
import { getPhotos } from "@/app/lib/actions";
import type { SortOption } from "@/app/lib/actions";
import { Loader2 } from "lucide-react";

interface Photo {
    id: string;
    url: string;
    displayUrl: string | null;
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
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [sortLoading, setSortLoading] = useState(false);

    const loadMore = async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const nextPhotos = await getPhotos(albumId, page, 20, sortBy);

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

    const handleSortChange = async (newSort: SortOption) => {
        if (newSort === sortBy) return;

        setSortBy(newSort);
        setSortLoading(true);

        try {
            // Re-fetch from page 0 with new sort order
            const freshPhotos = await getPhotos(albumId, 0, 20, newSort);
            setPhotos(freshPhotos);
            setPage(1);
            setHasMore(freshPhotos.length === 20);
        } catch (error) {
            console.error("Failed to sort photos:", error);
        } finally {
            setSortLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Sort Controls */}
            <div className="flex justify-end">
                <SortControl currentSort={sortBy} onSortChange={handleSortChange} />
            </div>

            {/* Photo Grid */}
            {sortLoading ? (
                <GallerySkeletonGrid count={photos.length || 4} />
            ) : (
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {photos.map((photo) => (
                    <PhotoCard
                        key={photo.id}
                        id={photo.id}
                        title={photo.title || undefined}
                        description={photo.description || undefined}
                        url={photo.url}
                        displayUrl={photo.displayUrl || undefined}
                        // @ts-ignore - Temporary until prisma client re-syncs
                        highResUrl={photo.highResUrl || undefined}
                        width={photo.width || undefined}
                        height={photo.height || undefined}
                        albumId={photo.albumId}
                        isAdmin={isAdmin}
                        albums={albums}
                    />
                ))}
            </div>
            )}

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
