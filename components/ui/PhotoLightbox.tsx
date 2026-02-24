"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface PhotoLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
    description?: string;
}

export default function PhotoLightbox({ isOpen, onClose, url, title, description }: PhotoLightboxProps) {
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "";
        };
    }, [isOpen, handleKeyDown]);

    const content = (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center"
                    onClick={onClose}
                    style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/90 backdrop-blur-xl" />

                    {/* Animated cosmic rings */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 0.3 }}
                        exit={{ scale: 1.5, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="absolute pointer-events-none"
                        style={{ width: "80vmin", height: "80vmin" }}
                    >
                        <div className="absolute inset-0 rounded-full border border-purple-500/30 animate-spin" style={{ animationDuration: "20s" }} />
                        <div className="absolute inset-4 rounded-full border border-blue-400/20 animate-spin" style={{ animationDuration: "15s", animationDirection: "reverse" }} />
                        <div className="absolute inset-8 rounded-full border border-pink-500/15 animate-spin" style={{ animationDuration: "25s" }} />
                    </motion.div>

                    {/* Floating particles */}
                    {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: [0, 0.6, 0],
                                scale: [0, 1, 0.5],
                                x: [0, (Math.random() - 0.5) * 200],
                                y: [0, (Math.random() - 0.5) * 200],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                delay: 0.2 + i * 0.1,
                                repeat: Infinity,
                                repeatType: "loop",
                            }}
                            className="absolute pointer-events-none"
                            style={{
                                width: 3 + Math.random() * 4,
                                height: 3 + Math.random() * 4,
                                borderRadius: "50%",
                                background: `radial-gradient(circle, ${["#a78bfa", "#f472b6", "#60a5fa", "#c084fc"][i % 4]}, transparent)`,
                                boxShadow: `0 0 ${8 + i * 2}px ${["#a78bfa", "#f472b6", "#60a5fa", "#c084fc"][i % 4]}`,
                                top: `${20 + Math.random() * 60}%`,
                                left: `${20 + Math.random() * 60}%`,
                            }}
                        />
                    ))}

                    {/* Content container */}
                    <motion.div
                        initial={{ scale: 0.75, y: 40, opacity: 0 }}
                        animate={{ scale: 1, y: 0, opacity: 1 }}
                        exit={{ scale: 0.85, y: 20, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 280, damping: 24 }}
                        className="relative z-10 flex flex-col max-w-[92vw] max-h-[90vh] sm:max-w-[80vw] lg:max-w-[65vw] xl:max-w-[55vw]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Close button */}
                        <motion.button
                            initial={{ opacity: 0, scale: 0, rotate: -90 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 400 }}
                            onClick={onClose}
                            className="absolute -top-3 -right-3 sm:-top-4 sm:-right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/25 text-white border border-white/20 backdrop-blur-sm transition-all hover:scale-110"
                            aria-label="Close lightbox"
                        >
                            <X className="w-5 h-5" />
                        </motion.button>

                        {/* Glowing border frame */}
                        <div className="relative rounded-2xl overflow-hidden" style={{ boxShadow: "0 0 60px rgba(139,92,246,0.3), 0 0 120px rgba(139,92,246,0.1), 0 4px 30px rgba(0,0,0,0.5)" }}>
                            {/* Animated gradient border */}
                            <motion.div
                                animate={{
                                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                                }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                                className="absolute -inset-[2px] rounded-2xl opacity-70"
                                style={{
                                    background: "linear-gradient(90deg, #8b5cf6, #ec4899, #3b82f6, #8b5cf6)",
                                    backgroundSize: "300% 100%",
                                }}
                            />

                            <div className="relative rounded-2xl overflow-hidden bg-gray-950 m-[2px]">
                                {/* Image with zoom-in effect */}
                                <motion.img
                                    src={url}
                                    alt={title || "Astronomy Photo"}
                                    className="max-h-[60vh] w-full object-contain bg-black"
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                                />

                                {/* Info pane */}
                                {(title || description) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25, duration: 0.4 }}
                                        className="p-5 sm:p-6 lg:p-8 bg-gradient-to-b from-gray-900/90 to-gray-950 border-t border-white/10"
                                    >
                                        {title && (
                                            <motion.h2
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.35, duration: 0.3 }}
                                                className="text-xl sm:text-2xl lg:text-3xl font-bold text-white mb-2"
                                                style={{
                                                    background: "linear-gradient(90deg, #ffffff, #c4b5fd, #ffffff)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent",
                                                    backgroundClip: "text",
                                                }}
                                            >
                                                {title}
                                            </motion.h2>
                                        )}
                                        {description && (
                                            <motion.p
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.45, duration: 0.3 }}
                                                className="text-gray-300 text-sm sm:text-base lg:text-lg leading-relaxed whitespace-pre-wrap"
                                            >
                                                {description}
                                            </motion.p>
                                        )}
                                    </motion.div>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );

    // Use a portal to render at the body level, escaping any CSS containing blocks
    if (typeof window === "undefined") return null;
    return createPortal(content, document.body);
}
