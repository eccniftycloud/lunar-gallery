import { getAlbums } from "@/app/lib/actions";
import AlbumCard from "@/components/ui/AlbumCard";
import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/auth";



export default async function AlbumsPage() {
    const albums = await getAlbums();
    const session = await auth();

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h1 className="text-3xl sm:text-4xl font-bold text-white">Your Collections</h1>
                {session?.user && (
                    <Link
                        href="/upload"
                        className="flex items-center gap-2 bg-gradient-to-r from-nebula-500 to-pink-600 text-white px-6 py-3 rounded-full font-medium hover:opacity-90 transition-opacity"
                    >
                        <Plus className="w-5 h-5" />
                        New Album
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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
