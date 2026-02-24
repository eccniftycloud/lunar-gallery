"use client";

import { motion } from "framer-motion";

/**
 * An animated crescent moon with a gentle glow, rotating halo,
 * and subtle crater details. Used as a decorative element next to titles.
 */
export default function MoonEffect({ size = 40 }: { size?: number }) {
    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            {/* Outer glow halo */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: "radial-gradient(circle, rgba(200,210,255,0.25) 0%, transparent 70%)",
                    filter: "blur(4px)",
                }}
                animate={{
                    scale: [1, 1.15, 1],
                    opacity: [0.6, 1, 0.6],
                }}
                transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Rotating ring / orbit */}
            <motion.div
                className="absolute rounded-full border border-white/10"
                style={{
                    inset: -4,
                }}
                animate={{ rotate: 360 }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                }}
            >
                {/* Tiny orbiting dot */}
                <div
                    className="absolute w-1.5 h-1.5 rounded-full bg-white/40"
                    style={{ top: -1, left: "50%", transform: "translateX(-50%)" }}
                />
            </motion.div>

            {/* Moon body */}
            <div
                className="absolute inset-0 rounded-full overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #e8e4d9 0%, #c8c4b8 40%, #a8a498 70%, #888478 100%)",
                    boxShadow: `
                        inset -${size * 0.15}px -${size * 0.05}px ${size * 0.2}px rgba(0,0,0,0.4),
                        0 0 ${size * 0.3}px rgba(200,210,255,0.3),
                        0 0 ${size * 0.6}px rgba(200,210,255,0.1)
                    `,
                }}
            >
                {/* Crater details */}
                <div
                    className="absolute rounded-full bg-black/10"
                    style={{ width: "18%", height: "18%", top: "20%", left: "25%" }}
                />
                <div
                    className="absolute rounded-full bg-black/8"
                    style={{ width: "12%", height: "12%", top: "45%", left: "55%" }}
                />
                <div
                    className="absolute rounded-full bg-black/10"
                    style={{ width: "22%", height: "22%", top: "60%", left: "30%" }}
                />
                <div
                    className="absolute rounded-full bg-black/6"
                    style={{ width: "10%", height: "10%", top: "30%", left: "65%" }}
                />

                {/* Crescent shadow overlay — makes it look like a waxing crescent */}
                <div
                    className="absolute inset-0 rounded-full"
                    style={{
                        background: `radial-gradient(circle at 75% 50%, transparent 30%, rgba(5,5,17,0.7) 60%, rgba(5,5,17,0.95) 80%)`,
                    }}
                />
            </div>

            {/* Subtle shimmer on top */}
            <motion.div
                className="absolute inset-0 rounded-full"
                style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
                }}
                animate={{
                    opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
        </div>
    );
}
