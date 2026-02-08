"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function GlassCanvas() {
    const [stars, setStars] = useState<{ id: number; top: string; left: string; size: number; delay: number }[]>([]);

    useEffect(() => {
        // Generate random stars on client-side only to avoid hydration mismatch
        const generatedStars = Array.from({ length: 50 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2 + 1,
            delay: Math.random() * 5,
        }));
        setStars(generatedStars);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            {/* Deep space background is handled in globals.css, this adds twinkling stars */}
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full bg-white opacity-20"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                    }}
                    animate={{
                        opacity: [0.2, 0.8, 0.2],
                        scale: [1, 1.2, 1],
                    }}
                    transition={{
                        duration: 3 + Math.random() * 2,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Subtle nebula fog overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cosmic-900/50 via-transparent to-transparent" />
        </div>
    );
}
