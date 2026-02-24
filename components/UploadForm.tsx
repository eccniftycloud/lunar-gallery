"use client";

import { useState } from "react";
import { uploadPhoto } from "@/app/lib/actions";
import { UploadCloud, Check, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

interface Album {
    id: string;
    name: string;
}

interface UploadFormProps {
    albums: Album[];
    initialAlbumId?: string;
}

export default function UploadForm({ albums, initialAlbumId }: UploadFormProps) {
    const router = useRouter();
    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!file) return;

        setLoading(true);
        setStatus("idle");

        const formData = new FormData(e.currentTarget);
        try {
            await uploadPhoto(formData);
            setStatus("success");
            setFile(null);
            (e.target as HTMLFormElement).reset();
            router.refresh();
            // Reset status after a delay
            setTimeout(() => setStatus("idle"), 3000);
        } catch (error) {
            console.error(error);
            setStatus("error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto glass-panel p-8 rounded-2xl">
            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Select Album</label>
                <select
                    name="albumId"
                    defaultValue={initialAlbumId || ""}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-nebula-500"
                >
                    <option value="">Uncategorized</option>
                    {albums.map(album => (
                        <option key={album.id} value={album.id}>{album.name}</option>
                    ))}
                </select>
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Photo Title</label>
                <input
                    type="text"
                    name="title"
                    placeholder="e.g. Andromeda Galaxy"
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-nebula-500"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Description <span className="text-gray-500">(optional)</span></label>
                <textarea
                    name="description"
                    placeholder="Describe what's in this capture..."
                    rows={3}
                    className="w-full bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-nebula-500 resize-none"
                />
            </div>

            <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">Image File</label>
                <div className="relative border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 transition-colors group">
                    <input
                        type="file"
                        name="file"
                        accept="image/*"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        required
                    />
                    <div className="flex flex-col items-center gap-2 pointer-events-none">
                        <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-nebula-400 transition-colors" />
                        <p className="text-sm text-gray-400">
                            {file ? file.name : "Drag & drop or click to upload"}
                        </p>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || !file}
                className="w-full bg-gradient-to-r from-nebula-500 to-pink-600 text-white font-medium py-3 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
            >
                {loading ? "Uploading..." : "Upload Photo"}
            </button>

            {status === "success" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-green-400 justify-center"
                >
                    <Check className="w-5 h-5" />
                    <span>Upload successful!</span>
                </motion.div>
            )}

            {status === "error" && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 text-red-400 justify-center"
                >
                    <AlertCircle className="w-5 h-5" />
                    <span>Upload failed. Please try again.</span>
                </motion.div>
            )}
        </form>
    );
}
