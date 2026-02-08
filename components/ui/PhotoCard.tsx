"use client";

import { motion } from "framer-motion";

interface PhotoCardProps {
    id: string;
    url: string;
    title?: string;
}

export default function PhotoCard({ id, url, title }: PhotoCardProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layoutId={`photo-${id}`}
            className="relative break-inside-avoid mb-4 group rounded-xl overflow-hidden glass-panel cursor-zoom-in"
        >
            <img
                src={url}
                alt={title || "Astronomy Photo"}
                className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                loading="lazy"
            />

            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                {title && <p className="text-white font-medium">{title}</p>}
            </div>
        </motion.div>
    );
}
