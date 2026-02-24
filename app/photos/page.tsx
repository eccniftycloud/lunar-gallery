import { getPhotos, getAlbums } from "@/app/lib/actions";
import { auth } from "@/auth";
import PaginatedGallery from "@/components/ui/PaginatedGallery";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AllPhotosPage() {
    const session = await auth();
    const photos = await getPhotos(undefined, 0, 20);
    const albums = await getAlbums();

    return (
        <div className="space-y-8 pb-20">
            <div className="flex items-center gap-4">
                <Link href="/" className="p-2 glass-panel rounded-full hover:bg-white/10 transition-colors text-gray-400 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-3xl sm:text-4xl font-bold text-white">All Captures</h1>
            </div>

            {photos.length > 0 ? (
                <PaginatedGallery initialPhotos={photos} isAdmin={!!session?.user} albums={albums.map(a => ({ id: a.id, name: a.name }))} />
            ) : (
                <div className="py-20 text-center glass-panel rounded-2xl border-dashed border-2 border-white/10">
                    <p className="text-xl text-gray-300 mb-4">No photos found in the archive.</p>
                    {session?.user && (
                        <Link href="/upload" className="text-nebula-400 hover:underline">
                            Upload your first photo
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
