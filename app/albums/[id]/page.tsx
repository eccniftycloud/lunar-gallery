import { getAlbum, getAlbums, getPhotos } from "@/app/lib/actions";
import PaginatedGallery from "@/components/ui/PaginatedGallery";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { auth } from "@/auth";

export default async function AlbumPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const album = await getAlbum(id);
    const photos = await getPhotos(id, 0, 100);
    const session = await auth();
    const allAlbums = await getAlbums();

    if (!album) {
        notFound();
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="relative glass-panel p-4 sm:p-8 rounded-2xl overflow-hidden">
                {album.coverImage && (
                    <div className="absolute inset-0 z-0">
                        <img src={album.coverImage} alt="" className="w-full h-full object-cover opacity-20 blur-md" />
                    </div>
                )}
                <div className="relative z-10 space-y-4">
                    <Link href="/albums" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Albums
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-2">{album.name}</h1>
                            {album.description && <p className="text-gray-300 max-w-2xl">{album.description}</p>}
                        </div>
                        {session?.user && (
                            <Link
                                href={`/upload?album=${id}`}
                                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors w-fit"
                            >
                                <Upload className="w-4 h-4" />
                                Add Photos
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Gallery */}
            {photos.length > 0 ? (
                <PaginatedGallery initialPhotos={photos} albumId={id} isAdmin={!!session?.user} albums={allAlbums.map(a => ({ id: a.id, name: a.name }))} />
            ) : null}

            {photos.length === 0 && (
                <div className="py-20 text-center">
                    <p className="text-gray-400 mb-4">This album is empty like a void.</p>
                    <Link href="/upload" className="text-nebula-400 hover:underline">
                        Upload some stars
                    </Link>
                </div>
            )}
        </div>
    );
}
