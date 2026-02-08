"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Folder } from "lucide-react";

interface AlbumCardProps {
    id: string;
    name: string;
    count: number;
    coverImage?: string;
}

export default function AlbumCard({ id, name, count, coverImage }: AlbumCardProps) {
    return (
        <Link href={`/albums/${id}`}>
            <motion.div
                whileHover={{ scale: 1.02, rotateX: 5, rotateY: 5 }}
                whileTap={{ scale: 0.98 }}
                className="relative group cursor-pointer"
                style={{ perspective: 1000 }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-nebula-500/20 to-purple-900/20 rounded-2xl blur-xl transition-opacity opacity-0 group-hover:opacity-100" />

                <div className="relative aspect-square rounded-2xl overflow-hidden glass-panel flex flex-col items-center justify-center border border-white/10 group-hover:border-nebula-400/50 transition-colors">
                    {coverImage ? (
                        <img src={coverImage} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        <Folder className="w-16 h-16 text-white/20 group-hover:text-nebula-400 transition-colors" />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />

                    <div className="absolute bottom-0 left-0 right-0 p-4">
                        <h3 className="text-lg font-bold text-white truncate">{name}</h3>
                        <p className="text-sm text-gray-400">{count} photos</p>
                    </div>
                </div>
            </motion.div>
        </Link>
    );
}
