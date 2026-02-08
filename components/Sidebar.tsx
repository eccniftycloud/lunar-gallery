"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Layers, UploadCloud, Settings, Telescope } from "lucide-react";
import { motion } from "framer-motion";
import clsx from "clsx";

const navItems = [
    { name: "Dashboard", href: "/", icon: Home },
    { name: "Albums", href: "/albums", icon: Layers },
    { name: "Upload", href: "/upload", icon: UploadCloud },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 glass-panel border-r border-white/10 p-6 flex flex-col z-50 transition-all duration-300">
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="p-2 rounded-lg bg-gradient-to-br from-nebula-500 to-pink-600 shadow-lg shadow-purple-900/50">
                    <Telescope className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent tracking-wider">
                    GRAVITY
                </h1>
            </div>

            <nav className="flex-1 space-y-2">
                {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                    return (
                        <Link key={item.name} href={item.href} className="block relative group">
                            {isActive && (
                                <motion.div
                                    layoutId="activeNav"
                                    className="absolute inset-0 bg-white/10 rounded-xl"
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                            )}
                            <div className={clsx(
                                "relative flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-200",
                                isActive ? "text-white" : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}>
                                <item.icon className={clsx("w-5 h-5", isActive ? "text-nebula-400" : "text-gray-500 group-hover:text-nebula-400")} />
                                <span className="font-medium text-sm">{item.name}</span>
                            </div>
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto px-2">
                <button className="flex items-center gap-3 px-4 py-3 text-gray-400 hover:text-white transition-colors w-full rounded-xl hover:bg-white/5">
                    <Settings className="w-5 h-5" />
                    <span className="font-medium text-sm">Settings</span>
                </button>
            </div>
        </aside>
    );
}
