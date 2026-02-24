"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Images, Upload, Settings, LogOut, LogIn, Menu, X } from "lucide-react";
import clsx from "clsx";
import { motion, AnimatePresence } from "framer-motion";
import { handleSignOut } from "@/app/lib/auth-actions";
import { useState, useEffect } from "react";
import MoonEffect from "@/components/ui/MoonEffect";

export default function Sidebar({ session, siteTitle }: { session: any, siteTitle: string }) {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = useState(false);

    // Close mobile menu on route change
    useEffect(() => {
        setMobileOpen(false);
    }, [pathname]);

    const links = [
        { href: "/", label: "Dashboard", icon: LayoutDashboard },
        { href: "/albums", label: "Albums", icon: Images },
        // Only show upload and settings if logged in
        ...(session?.user ? [
            { href: "/upload", label: "Upload", icon: Upload },
            { href: "/settings", label: "Settings", icon: Settings },
        ] : []),
    ];

    const navContent = (
        <>
            <div className="p-6 lg:p-8">
                <Link href="/" className="flex items-center gap-3">
                    <MoonEffect size={32} />
                    <div>
                        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-nebula-300 via-white to-nebula-300 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)] animate-aurora">
                            {siteTitle}
                        </h1>
                        <p className="text-xs text-nebula-400 tracking-widest uppercase mt-0.5">Observatory</p>
                    </div>
                </Link>
            </div>

            <nav className="flex-1 px-3 lg:px-4 space-y-2">
                {links.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href;

                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={clsx(
                                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden",
                                isActive
                                    ? "text-white bg-white/10 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <Icon className={clsx("w-5 h-5 transition-transform group-hover:scale-110", isActive && "text-nebula-300")} />
                            <span className="relative z-10">{link.label}</span>
                            {isActive && (
                                <motion.div
                                    layoutId="active-pill"
                                    className="absolute inset-0 bg-gradient-to-r from-nebula-500/20 to-transparent rounded-xl"
                                    initial={false}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/10">
                {session?.user ? (
                    <form action={handleSignOut}>
                        <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-xl w-full transition-all">
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </button>
                    </form>
                ) : (
                    <Link href="/login" className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white hover:bg-nebula-500/10 rounded-xl w-full transition-all">
                        <LogIn className="w-5 h-5" />
                        <span>Login</span>
                    </Link>
                )}
            </div>
        </>
    );

    return (
        <>
            {/* Mobile hamburger button */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg glass-panel border border-white/10 text-white"
                aria-label="Open menu"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile sidebar overlay */}
            <AnimatePresence>
                {mobileOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setMobileOpen(false)}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
                        />
                        <motion.div
                            initial={{ x: -280 }}
                            animate={{ x: 0 }}
                            exit={{ x: -280 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="fixed left-0 top-0 w-[280px] h-screen glass-panel border-r border-white/10 flex flex-col z-50"
                        >
                            <button
                                onClick={() => setMobileOpen(false)}
                                className="absolute top-4 right-4 p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                                aria-label="Close menu"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            {navContent}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop sidebar — always visible */}
            <div className="hidden lg:flex w-64 h-screen fixed left-0 top-0 glass-panel border-r border-white/10 flex-col z-50">
                {navContent}
            </div>
        </>
    );
}
