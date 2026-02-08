import { getAlbums } from "@/app/lib/actions";
import AlbumCard from "@/components/ui/AlbumCard";
import Link from "next/link";
import { Plus } from "lucide-react";I components(Button, Card, Input, Modal / Dialog)
￼ Setup Main Layout and Sidebar Navigation
￼ Features Implementation
￼ Define Database Schema(Album, Photo)
￼ Implement Server Actions / API for Photos and Albums
￼ Build Gallery View(Masonry / Grid)
￼ Build Album Detail View
￼ Build Upload Interface
￼ Verification & Polish
￼ Seed database with sample categories
￼ Verify animations and responsiveness
￼ Final Project Walkthrough
￼


export default async function AlbumsPage() {
    const albums = await getAlbums();

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-4xl font-bold text-white">Your Collections</h1>
                <Link
                    href="/upload"
                    className="flex items-center gap-2 bg-gradient-to-r from-nebula-500 to-pink-600 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
                >
                    <Plus className="w-5 h-5" />
                    New Album
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {albums.map((album) => (
                    <AlbumCard
                        key={album.id}
                        id={album.id}
                        name={album.name}
                        count={album._count.photos}
                        coverImage={album.coverImage || undefined}
                    />
                ))}

                {albums.length === 0 && (
                    <div className="col-span-full py-20 text-center glass-panel rounded-2xl border-dashed border-2 border-white/10 flex flex-col items-center justify-center gap-4">
                        <p className="text-xl text-gray-300">No albums found in this sector.</p>
                        <Link href="/upload" className="text-nebula-400 hover:underline">
                            Create your first cosmic collection
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
