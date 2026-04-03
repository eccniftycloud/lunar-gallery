"use client";

import type { ViewMode } from "./PhotoCard";

/**
 * PhotoSkeleton — A shimmering placeholder that mimics the shape of a PhotoCard.
 * Used during sort transitions and initial page loads.
 * Accepts optional viewMode to match Grid vs Masonry shape and dominantColor for cosmic tinting.
 */
export function PhotoSkeleton({ viewMode = "grid", dominantColor }: { viewMode?: ViewMode; dominantColor?: string }) {
    const bgStyle = dominantColor
        ? { backgroundColor: `${dominantColor}22` }
        : undefined;

    const isGrid = viewMode === "grid";

    return (
        <div className={`rounded-xl overflow-hidden glass-panel ${isGrid ? "" : "break-inside-avoid mb-4"}`}>
            {/* Image placeholder */}
            <div
                className={`w-full skeleton-shimmer ${isGrid ? "aspect-square" : "aspect-video"}`}
                style={bgStyle}
            />
            {/* Title placeholder */}
            <div className="px-3 py-3 space-y-2 bg-white/5 border-t border-white/10">
                <div className="h-4 w-3/4 rounded-md skeleton-shimmer" />
                <div className="h-3 w-full rounded-md skeleton-shimmer" />
                <div className="h-3 w-2/3 rounded-md skeleton-shimmer" />
            </div>
        </div>
    );
}

/**
 * AlbumSkeleton — A shimmering placeholder that mimics the shape of an AlbumCard.
 */
export function AlbumSkeleton() {
    return (
        <div className="relative">
            <div className="relative aspect-square rounded-2xl overflow-hidden glass-panel border border-white/10">
                {/* Cover image placeholder */}
                <div className="w-full h-full skeleton-shimmer" />
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                {/* Text placeholders */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
                    <div className="h-5 w-2/3 rounded-md skeleton-shimmer" />
                    <div className="h-3 w-1/3 rounded-md skeleton-shimmer" />
                </div>
            </div>
        </div>
    );
}

/**
 * GallerySkeletonGrid — A full grid of photo skeletons.
 * Pass `count` to control how many placeholders appear.
 * Accepts viewMode to match the current gallery layout style.
 */
export function GallerySkeletonGrid({ count = 8, viewMode = "grid" }: { count?: number; viewMode?: ViewMode }) {
    const gridClasses = viewMode === "grid"
        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
        : "columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-0";

    return (
        <div className={gridClasses}>
            {Array.from({ length: count }).map((_, i) => (
                <PhotoSkeleton key={i} viewMode={viewMode} />
            ))}
        </div>
    );
}

/**
 * AlbumSkeletonGrid — A full grid of album skeletons.
 */
export function AlbumSkeletonGrid({ count = 4 }: { count?: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <AlbumSkeleton key={i} />
            ))}
        </div>
    );
}
