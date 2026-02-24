import Link from "next/link";
import { getAlbums, getPhotos, getAdminConfig } from "./lib/actions";
import AlbumCard from "@/components/ui/AlbumCard";
import PhotoCard from "@/components/ui/PhotoCard";
import { Plus, ArrowRight } from "lucide-react";
import { auth } from "@/auth";
import HeroMoon from "@/components/ui/HeroMoon";

export default async function Home() {
  const session = await auth();
  const albums = await getAlbums();
  const recentPhotos = await getPhotos();
  const adminConfig = await getAdminConfig();

  // Limit to 4 albums and 8 photos for dashboard
  const featuredAlbums = albums.slice(0, 4);
  const featuredPhotos = recentPhotos.slice(0, 8);

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative py-12 overflow-hidden">
        {/* Background lunar glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-nebula-500/10 blur-3xl rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 blur-2xl rounded-full" />
        </div>

        {/* Moon + Title cluster */}
        <div className="flex flex-col items-center gap-6">
          <HeroMoon />
          <h1 className="text-4xl sm:text-6xl md:text-8xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-nebula-300 via-white to-nebula-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.4)] animate-aurora tracking-tight lunar-title">
            {adminConfig?.siteTitle || "Lunar Gallery"}
          </h1>
          <p className="text-base sm:text-xl text-center text-gray-400 max-w-2xl mx-auto px-4">
            Your personal observatory of astronomy photography.
            Curate your cosmos into collections and share the night sky.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center mt-6 sm:mt-8 gap-3 sm:gap-4 px-4">
          {session?.user && (
            <Link
              href="/upload"
              className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Upload Photo
            </Link>
          )}
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
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <h2 className="text-2xl font-bold text-white">Featured Albums</h2>
          <Link href="/albums" className="text-sm text-nebula-400 hover:text-nebula-300 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
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

      {/* Recent Photos Section */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Recent Captures</h2>
          <Link href="/photos" className="text-sm text-nebula-400 hover:text-nebula-300 flex items-center gap-1">
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4 space-y-4">
          {featuredPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              id={photo.id}
              title={photo.title || undefined}
              description={photo.description || undefined}
              url={photo.url}
              width={photo.width || undefined}
              height={photo.height || undefined}
              albumId={photo.albumId}
              isAdmin={!!session?.user}
              albums={albums.map(a => ({ id: a.id, name: a.name }))}
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
