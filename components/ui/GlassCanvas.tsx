"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface Star {
    id: number;
    top: string;
    left: string;
    size: number;
    delay: number;
    duration: number;
    color: string;
}

interface ShootingStar {
    id: number;
    top: string;
    left: string;
    angle: number;
    delay: number;
    duration: number;
}

export default function GlassCanvas() {
    const [stars, setStars] = useState<Star[]>([]);
    const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);

    useEffect(() => {
        const starColors = [
            "rgba(255, 255, 255, 0.9)",
            "rgba(200, 220, 255, 0.9)",  // blue-white
            "rgba(255, 240, 220, 0.8)",  // warm yellow
            "rgba(180, 200, 255, 0.8)",  // cool blue
            "rgba(255, 200, 180, 0.6)",  // soft red
        ];

        const generatedStars = Array.from({ length: 80 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            size: Math.random() * 2.5 + 0.5,
            delay: Math.random() * 8,
            duration: 2 + Math.random() * 4,
            color: starColors[Math.floor(Math.random() * starColors.length)],
        }));
        setStars(generatedStars);

        // Shooting stars — periodic
        const generatedShootingStars = Array.from({ length: 4 }).map((_, i) => ({
            id: i,
            top: `${Math.random() * 40}%`,
            left: `${Math.random() * 60 + 10}%`,
            angle: 25 + Math.random() * 20,
            delay: i * 6 + Math.random() * 4,
            duration: 0.8 + Math.random() * 0.6,
        }));
        setShootingStars(generatedShootingStars);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden">
            {/* Star field */}
            {stars.map((star) => (
                <motion.div
                    key={star.id}
                    className="absolute rounded-full"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: star.size,
                        height: star.size,
                        backgroundColor: star.color,
                        boxShadow: star.size > 1.5
                            ? `0 0 ${star.size * 3}px ${star.color}`
                            : "none",
                    }}
                    animate={{
                        opacity: [0.15, 0.9, 0.15],
                        scale: [1, 1.3, 1],
                    }}
                    transition={{
                        duration: star.duration,
                        repeat: Infinity,
                        delay: star.delay,
                        ease: "easeInOut",
                    }}
                />
            ))}

            {/* Shooting stars */}
            {shootingStars.map((ss) => (
                <motion.div
                    key={`ss-${ss.id}`}
                    className="absolute"
                    style={{
                        top: ss.top,
                        left: ss.left,
                        width: "80px",
                        height: "1px",
                        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.8), transparent)",
                        transformOrigin: "left center",
                        rotate: `${ss.angle}deg`,
                    }}
                    animate={{
                        x: [0, 300],
                        y: [0, 150],
                        opacity: [0, 1, 0],
                        scaleX: [0.3, 1, 0.1],
                    }}
                    transition={{
                        duration: ss.duration,
                        repeat: Infinity,
                        repeatDelay: 12 + Math.random() * 10,
                        delay: ss.delay,
                        ease: "easeOut",
                    }}
                />
            ))}

            {/* Nebula orbs — slow drifting cosmic clouds */}
            <motion.div
                className="absolute w-[500px] h-[500px] rounded-full"
                style={{
                    top: "10%",
                    right: "-5%",
                    background: "radial-gradient(circle, rgba(168,85,247,0.08) 0%, transparent 70%)",
                    filter: "blur(60px)",
                }}
                animate={{
                    x: [0, -30, 0],
                    y: [0, 20, 0],
                    scale: [1, 1.1, 1],
                }}
                transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute w-[400px] h-[400px] rounded-full"
                style={{
                    bottom: "5%",
                    left: "10%",
                    background: "radial-gradient(circle, rgba(236,72,153,0.06) 0%, transparent 70%)",
                    filter: "blur(50px)",
                }}
                animate={{
                    x: [0, 25, 0],
                    y: [0, -15, 0],
                    scale: [1, 1.15, 1],
                }}
                transition={{
                    duration: 25,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <motion.div
                className="absolute w-[350px] h-[350px] rounded-full"
                style={{
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    background: "radial-gradient(circle, rgba(56,189,248,0.04) 0%, transparent 70%)",
                    filter: "blur(40px)",
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />

            {/* Gradient overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cosmic-900/50 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-transparent to-cosmic-900/30" />
        </div>
    );
}
