import { getAlbums, createAlbum } from "@/app/lib/actions";
import UploadForm from "@/components/UploadForm";
import { Plus } from "lucide-react";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function UploadPage({ searchParams }: { searchParams: { album?: string } }) {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const albums = await getAlbums();
    const { album } = searchParams;

    return (
        <div className="max-w-4xl mx-auto space-y-12">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold text-white">Upload to Gallery</h1>
                <p className="text-gray-400">Add new astrophotography to your personal collection.</p>
            </div>

            {/* Upload Section */}
            <section>
                <UploadForm albums={albums} initialAlbumId={album} />
            </section>

            {/* Quick Create Album Section */}
            <section className="pt-12 border-t border-white/10">
                <h2 className="text-2xl font-bold text-white mb-6 text-center">New Album</h2>
                <form action={createAlbum} className="max-w-xl mx-auto glass-panel p-8 rounded-2xl space-y-6">
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Album Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="e.g. Solar System"
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-nebula-500"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Description</label>
                        <textarea
                            name="description"
                            placeholder="Optional description..."
                            className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-nebula-500"
                            rows={3}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">Cover Image</label>
                        <input
                            type="file"
                            name="coverImage"
                            accept="image/*"
                            className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-white/10 file:text-white hover:file:bg-white/20"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-white/10 text-white font-medium py-3 rounded-lg hover:bg-white/20 transition-colors flex items-center justify-center gap-2"
                    >
                        <Plus className="w-5 h-5" />
                        Create Album
                    </button>
                </form>
            </section>
        </div>
    );
}
