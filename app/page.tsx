import Link from "next/link";
import { getAlbums, getPhotos } from "./lib/actions";
import AlbumCard from "@/components/ui/AlbumCard";
import PhotoCard from "@/components/ui/PhotoCard";
import { Plus, ArrowRight } from "lucide-react";

export default async function Home() {
  const albums = await getAlbums();
  const recentPhotos = await getPhotos(); // Get all for now, maybe limit in action later

  // Limit to 4 albums and 8 photos for dashboard
  const featuredAlbums = albums.slice(0, 4);
  const featuredPhotos = recentPhotos.slice(0, 8);

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative py-12">
        <div className="absolute inset-0 bg-nebula-500/10 blur-3xl -z-10 rounded-full w-2/3 h-2/3 mx-auto" />
        <h1 className="text-5xl md:text-7xl font-bold text-center bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent mb-6 tracking-tight">
          Gravity Gallery
        </h1>
        <p className="text-xl text-center text-gray-400 max-w-2xl mx-auto">
          Your personal universe of astronomy photography.
          Organize your cosmos into collections and share the stars.
        </p>

        <div className="flex justify-center mt-8 gap-4">
          <Link
            href="/upload"
            className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Upload Photo
          </Link>
          <Link
            href="/albums"
            className="flex items-center gap-2 glass-panel px-6 py-3 rounded-full font-medium hover:bg-white/10 transition-colors"
          >
            Browse Albums
          </Link>
        </div>
      </section>

      {/* Albums Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Albums</h2>
          <Link href="/albums" className="text-sm text-nebula-400 hover:text-nebula-300 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredAlbums.map((album) => (
            <AlbumCard
              key={album.id}
              id={album.id}
              name={album.name}
              count={album._count.photos}
              coverImage={album.coverImage || undefined}
            />
          ))}

          {featuredAlbums.length === 0 && (
            <div className="col-span-full py-12 text-center glass-panel rounded-2xl border-dashed border-2 border-white/10">
              <p className="text-gray-400 mb-4">No albums created yet.</p>
              <Link href="/albums/create" className="text-nebula-400 hover:underline">
                Create your first album
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Rceent Photos Section */}
      <section>
        <h2 className="text-2xl font-bold text-white mb-8">Recent Captures</h2>

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {featuredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              id={photo.id}
              title={photo.title || undefined}
              url={photo.url}
            />
          ))}

          {featuredPhotos.length === 0 && (
            <div className="py-12 text-center text-gray-500 w-full break-inside-avoid">
              No photos uploaded yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
