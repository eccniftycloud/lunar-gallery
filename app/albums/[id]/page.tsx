import { getAlbum, getPhotos } from "@/app/lib/actions";
import PhotoCard from "@/components/ui/PhotoCard";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";

export default async function AlbumPage({ params }: { params: { id: string } }) {
    const { id } = params;
    const album = await getAlbum(id);
    const photos = await getPhotos(id);

    if (!album) {
        notFound();
    }

    return (
        <div className="space-y-8 pb-20">
            {/* Header */}
            <div className="relative glass-panel p-8 rounded-2xl overflow-hidden">
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
                            <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{album.name}</h1>
                            {album.description && <p className="text-gray-300 max-w-2xl">{album.description}</p>}
                        </div>
                        <Link
                            href={`/upload?album=${id}`}
                            className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-lg flex items-center gap-2 transition-colors w-fit"
                        >
                            <Upload className="w-4 h-4" />
                            Add Photos
                        </Link>
                    </div>
                </div>
            </div>

            {/* Gallery */}
            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
                {photos.map((photo) => (
                    <PhotoCard
                        key={photo.id}
                        id={photo.id}
                        title={photo.title || undefined}
                        url={photo.url}
                    />
                ))}
            </div>

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
