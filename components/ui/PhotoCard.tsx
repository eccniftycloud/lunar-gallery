"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { Trash2, Pencil, X, Check, FolderInput } from "lucide-react";
import { deletePhoto, updatePhoto, movePhoto } from "@/app/lib/actions";
import { useRouter } from "next/navigation";
import PhotoLightbox from "./PhotoLightbox";
import Image from "next/image";

interface Album {
    id: string;
    name: string;
}

interface PhotoCardProps {
    id: string;
    url: string;
    title?: string;
    description?: string;
    width?: number;
    height?: number;
    albumId?: string | null;
    isAdmin?: boolean;
    albums?: Album[];
}

export default function PhotoCard({ id, url, title, description, width, height, albumId, isAdmin, albums }: PhotoCardProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showMove, setShowMove] = useState(false);
    const [isMoving, setIsMoving] = useState(false);
    const [editTitle, setEditTitle] = useState(title || "");
    const [editDescription, setEditDescription] = useState(description || "");
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            await deletePhoto(id);
            router.refresh();
        } catch (err) {
            console.error("Delete failed:", err);
            setIsDeleting(false);
            setShowConfirm(false);
        }
    };

    const handleSave = async () => {
        try {
            await updatePhoto(id, {
                title: editTitle || undefined,
                description: editDescription || undefined,
            });
            setIsEditing(false);
            router.refresh();
        } catch (err) {
            console.error("Update failed:", err);
        }
    };

    const handleMove = async (targetAlbumId: string | null) => {
        setIsMoving(true);
        try {
            await movePhoto(id, targetAlbumId);
            setShowMove(false);
            router.refresh();
        } catch (err) {
            console.error("Move failed:", err);
        } finally {
            setIsMoving(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            layoutId={`photo-${id}`}
            className="relative break-inside-avoid mb-4 group rounded-xl overflow-hidden glass-panel"
        >
            {width && height ? (
                <Image
                    src={url}
                    alt={title || "Astronomy Photo"}
                    width={width}
                    height={height}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                    onClick={() => setLightboxOpen(true)}
                />
            ) : (
                <img
                    src={url}
                    alt={title || "Astronomy Photo"}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-105 cursor-pointer"
                    loading="lazy"
                    onClick={() => setLightboxOpen(true)}
                />
            )}

            {/* Photo info — always visible below image */}
            {(title || description) && (
                <div
                    className="px-3 py-2 bg-white/5 border-t border-white/10 cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => setLightboxOpen(true)}
                >
                    {title && <p className="text-white font-medium text-sm">{title}</p>}
                    {description && <p className="text-gray-400 text-xs mt-1 line-clamp-3">{description}</p>}
                </div>
            )}

            {/* Admin action bar — always visible, below the image */}
            {isAdmin && !isEditing && !showConfirm && !showMove && (
                <div className="relative z-10 flex items-center justify-between px-3 py-2 bg-white/5 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                        >
                            <Pencil className="w-3.5 h-3.5" />
                            Edit
                        </button>
                        {albums && albums.length > 0 && (
                            <button
                                onClick={() => setShowMove(true)}
                                className="flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                            >
                                <FolderInput className="w-3.5 h-3.5" />
                                Move
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setShowConfirm(true)}
                        className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-colors"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                </div>
            )}

            {/* Move to album overlay */}
            <AnimatePresence>
                {showMove && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col p-4 z-20"
                    >
                        <p className="text-white text-sm font-medium mb-3">Move to album:</p>
                        <div className="flex-1 overflow-y-auto space-y-1.5">
                            {/* Uncategorized option */}
                            <button
                                onClick={() => handleMove(null)}
                                disabled={isMoving || !albumId}
                                className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-40 ${!albumId
                                        ? "bg-nebula-500/30 text-nebula-300 border border-nebula-500/50"
                                        : "bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white"
                                    }`}
                            >
                                Uncategorized
                            </button>
                            {/* Album options */}
                            {albums?.map((album) => (
                                <button
                                    key={album.id}
                                    onClick={() => handleMove(album.id)}
                                    disabled={isMoving || albumId === album.id}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-40 ${albumId === album.id
                                            ? "bg-nebula-500/30 text-nebula-300 border border-nebula-500/50"
                                            : "bg-white/5 text-gray-300 hover:bg-white/15 hover:text-white"
                                        }`}
                                >
                                    {album.name}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => setShowMove(false)}
                            className="mt-3 w-full px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                        >
                            Cancel
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Delete confirmation overlay */}
            <AnimatePresence>
                {showConfirm && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-3 z-20"
                    >
                        <p className="text-white text-sm font-medium">Delete this photo?</p>
                        <div className="flex gap-2">
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
                            >
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                            <button
                                onClick={() => setShowConfirm(false)}
                                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 text-white text-sm rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Edit overlay */}
            <AnimatePresence>
                {isEditing && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/85 backdrop-blur-sm flex flex-col p-4 z-20"
                    >
                        <div className="flex-1 flex flex-col gap-3 justify-center">
                            <input
                                value={editTitle}
                                onChange={(e) => setEditTitle(e.target.value)}
                                placeholder="Title"
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-nebula-500"
                            />
                            <textarea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                placeholder="Description..."
                                rows={3}
                                className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-nebula-500 resize-none"
                            />
                        </div>
                        <div className="flex gap-2 justify-end mt-2">
                            <button
                                onClick={handleSave}
                                className="p-2 rounded-lg bg-green-600/80 hover:bg-green-600 text-white transition-colors"
                                title="Save"
                            >
                                <Check className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditTitle(title || "");
                                    setEditDescription(description || "");
                                }}
                                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                                title="Cancel"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Lightbox */}
            <PhotoLightbox
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                url={url}
                title={title}
                description={description}
            />
        </motion.div>
    );
}
