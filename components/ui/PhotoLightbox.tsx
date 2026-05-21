"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronDown, ChevronUp, Camera, Clock, Crosshair, Thermometer, Layers, Aperture, Focus, Cpu, Calendar, Maximize } from "lucide-react";
import { useEffect, useCallback, useState, useMemo } from "react";
import { createPortal } from "react-dom";

interface TechSpec {
    make?: string;
    model?: string;
    software?: string;
    captureDate?: string;
    exposureTime?: string;
    exposureTimeRaw?: number;
    iso?: number;
    fNumber?: string;
    focalLength?: string;
    focalLength35mm?: string;
    gain?: number;
    sensorTemp?: string;
    frameCount?: number;
    stackCount?: number;
    resolution?: string;
    imageDescription?: string;
    userComment?: string;
    subject?: string;
    title?: string;
    whiteBalance?: number;
}

interface PhotoLightboxProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title?: string;
    description?: string;
    nativeWidth?: number;
    nativeHeight?: number;
    tags?: string[];
    technicalData?: string | null;
}

// Map tech spec keys to human-readable labels and icons
const SPEC_CONFIG: Record<string, { label: string; icon: React.ComponentType<any> }> = {
    make: { label: "Camera/Telescope", icon: Camera },
    model: { label: "Model", icon: Camera },
    software: { label: "Software", icon: Cpu },
    captureDate: { label: "Capture Date", icon: Calendar },
    exposureTime: { label: "Exposure", icon: Clock },
    iso: { label: "ISO", icon: Crosshair },
    fNumber: { label: "Aperture", icon: Aperture },
    focalLength: { label: "Focal Length", icon: Focus },
    focalLength35mm: { label: "Focal (35mm eq.)", icon: Focus },
    gain: { label: "Gain", icon: Crosshair },
    sensorTemp: { label: "Sensor Temp", icon: Thermometer },
    frameCount: { label: "Frames", icon: Layers },
    stackCount: { label: "Stacked", icon: Layers },
    resolution: { label: "Resolution", icon: Maximize },
};

export default function PhotoLightbox({ isOpen, onClose, url, title, description, nativeWidth, nativeHeight, tags, technicalData }: PhotoLightboxProps) {
    const [showTechData, setShowTechData] = useState(false);

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

    // Reset tech data panel when lightbox closes
    useEffect(() => {
        if (!isOpen) setShowTechData(false);
    }, [isOpen]);

    // Parse technical data JSON
    const techSpecs: TechSpec | null = useMemo(() => {
        if (!technicalData) return null;
        try {
            return JSON.parse(technicalData);
        } catch {
            return null;
        }
    }, [technicalData]);

    // Filter to displayable specs (skip raw values, descriptions that are shown elsewhere)
    const displayableSpecs = useMemo(() => {
        if (!techSpecs) return [];
        const skipKeys = new Set(["exposureTimeRaw", "imageDescription", "userComment", "subject", "title", "whiteBalance"]);
        return Object.entries(techSpecs)
            .filter(([key, value]) => !skipKeys.has(key) && value != null && String(value).length > 0)
            .map(([key, value]) => {
                const config = SPEC_CONFIG[key];
                let displayValue = String(value);

                // Format captureDate nicely
                if (key === "captureDate") {
                    try {
                        const d = new Date(value as string);
                        displayValue = d.toLocaleDateString("en-US", {
                            year: "numeric", month: "short", day: "numeric",
                            hour: "2-digit", minute: "2-digit"
                        });
                    } catch { /* use raw string */ }
                }

                return {
                    key,
                    label: config?.label || key.replace(/([A-Z])/g, " $1").trim(),
                    icon: config?.icon || Camera,
                    value: displayValue,
                };
            });
    }, [techSpecs]);

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
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 0 }}
                        dragElastic={0.8}
                        onDragEnd={(e, info) => {
                            if (Math.abs(info.offset.y) > 50 || Math.abs(info.velocity.y) > 300) {
                                onClose();
                            }
                        }}
                        style={{ touchAction: "none", width: "100%", maxWidth: "95vw" }}
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
                        <div className="relative rounded-2xl flex flex-col overflow-hidden" style={{ boxShadow: "0 0 60px rgba(139,92,246,0.3), 0 0 120px rgba(139,92,246,0.1), 0 4px 30px rgba(0,0,0,0.5)" }}>
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

                            <div className="relative rounded-2xl overflow-hidden inline-flex flex-col bg-gray-950 m-[2px]">
                                {/* Image with zoom-in effect — capped at native resolution */}
                                <motion.img
                                    src={url}
                                    alt={title || "Astronomy Photo"}
                                    className="max-h-[75vh] w-auto h-auto block mx-auto object-contain"
                                    style={{
                                        maxWidth: "100%",
                                        ...(nativeWidth ? { maxWidth: `min(100%, ${nativeWidth}px)` } : {}),
                                        ...(nativeHeight ? { maxHeight: `min(75vh, ${nativeHeight}px)` } : {}),
                                        pointerEvents: "none" // Prevents default image drag interference
                                    }}
                                    initial={{ opacity: 0, scale: 1.05 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.15, duration: 0.5, ease: "easeOut" }}
                                />

                                {/* Info pane — w-0 min-w-full prevents text from expanding container beyond image width */}
                                {(title || description || (tags && tags.length > 0)) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: 0.25, duration: 0.4 }}
                                        className="p-5 sm:p-6 lg:p-8 bg-gradient-to-b from-gray-900/90 to-gray-950 border-t border-white/10 w-0 min-w-full"
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

                                        {/* Phase 11b: Tags display as glassmorphism pills */}
                                        {tags && tags.length > 0 && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 8 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: 0.55, duration: 0.3 }}
                                                className="hidden sm:flex flex-wrap gap-2 mt-3"
                                            >
                                                {tags.map((tag, i) => (
                                                    <motion.span
                                                        key={tag}
                                                        initial={{ opacity: 0, scale: 0.8 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: 0.6 + i * 0.05, duration: 0.2 }}
                                                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium
                                                            bg-white/[0.07] backdrop-blur-md border border-white/[0.12]
                                                            text-purple-200 hover:bg-white/[0.12] hover:border-purple-400/30
                                                            transition-all duration-200 cursor-default"
                                                        style={{
                                                            boxShadow: "0 0 8px rgba(139, 92, 246, 0.08), inset 0 1px 0 rgba(255,255,255,0.05)",
                                                        }}
                                                    >
                                                        <span className="w-1.5 h-1.5 rounded-full bg-purple-400/60 mr-1.5" />
                                                        {tag}
                                                    </motion.span>
                                                ))}
                                            </motion.div>
                                        )}

                                        {/* Phase 11c: Technical Data toggle button */}
                                        {displayableSpecs.length > 0 && (
                                            <motion.button
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.65, duration: 0.3 }}
                                                onClick={() => setShowTechData(!showTechData)}
                                                className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium
                                                    bg-white/[0.05] backdrop-blur-md border border-white/[0.1]
                                                    text-gray-300 hover:bg-white/[0.1] hover:text-white hover:border-purple-500/30
                                                    transition-all duration-300 group"
                                                style={{
                                                    boxShadow: showTechData
                                                        ? "0 0 20px rgba(139, 92, 246, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)"
                                                        : "inset 0 1px 0 rgba(255,255,255,0.05)",
                                                }}
                                            >
                                                <Camera className="w-3.5 h-3.5 text-purple-400 group-hover:text-purple-300" />
                                                Technical Data
                                                {showTechData
                                                    ? <ChevronUp className="w-3.5 h-3.5 ml-1" />
                                                    : <ChevronDown className="w-3.5 h-3.5 ml-1" />
                                                }
                                            </motion.button>
                                        )}
                                    </motion.div>
                                )}

                                {/* Phase 11c: Technical Data Glassmorphism Panel */}
                                <AnimatePresence>
                                    {showTechData && displayableSpecs.length > 0 && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.35, ease: "easeInOut" }}
                                            className="overflow-hidden w-0 min-w-full"
                                        >
                                            <div
                                                className="px-5 sm:px-6 lg:px-8 pb-5 sm:pb-6 lg:pb-8 bg-gradient-to-b from-gray-950 to-gray-900/80"
                                            >
                                                {/* Decorative separator */}
                                                <div className="mb-4 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

                                                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                                                    {displayableSpecs.map((spec, i) => {
                                                        const IconComponent = spec.icon;
                                                        return (
                                                            <motion.div
                                                                key={spec.key}
                                                                initial={{ opacity: 0, y: 10 }}
                                                                animate={{ opacity: 1, y: 0 }}
                                                                transition={{ delay: i * 0.04, duration: 0.25 }}
                                                                className="flex items-start gap-2.5 p-3 rounded-xl
                                                                    bg-white/[0.03] border border-white/[0.06]
                                                                    hover:bg-white/[0.06] hover:border-purple-500/20
                                                                    transition-all duration-200"
                                                                style={{
                                                                    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.02)",
                                                                }}
                                                            >
                                                                <div className="flex-shrink-0 mt-0.5">
                                                                    <IconComponent className="w-3.5 h-3.5 text-purple-400/70" />
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-0.5 truncate">
                                                                        {spec.label}
                                                                    </p>
                                                                    <p className="text-xs text-gray-200 font-mono truncate" title={spec.value}>
                                                                        {spec.value}
                                                                    </p>
                                                                </div>
                                                            </motion.div>
                                                        );
                                                    })}
                                                </div>

                                                {/* Show extra notes from EXIF if available */}
                                                {techSpecs && (techSpecs.imageDescription || techSpecs.userComment) && (
                                                    <motion.div
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.3, duration: 0.3 }}
                                                        className="mt-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05]"
                                                    >
                                                        <p className="text-[10px] uppercase tracking-wider text-gray-500 font-medium mb-1">
                                                            Telescope Notes
                                                        </p>
                                                        <p className="text-xs text-gray-300 leading-relaxed">
                                                            {techSpecs.imageDescription || techSpecs.userComment}
                                                        </p>
                                                    </motion.div>
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
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
