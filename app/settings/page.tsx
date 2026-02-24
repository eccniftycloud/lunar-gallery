import { auth } from "@/auth";
import { redirect } from "next/navigation";
import prisma from "@/app/lib/prisma";
import { Settings, Database, User, Image, FolderOpen, Shield, KeyRound, Paintbrush } from "lucide-react";
import PasswordChangeForm from "./PasswordChangeForm";
import TitleChangeForm from "./TitleChangeForm";
import { getAdminConfig } from "@/app/lib/actions";

export default async function SettingsPage() {
    const session = await auth();
    if (!session?.user) {
        redirect('/login');
    }

    const albumCount = await prisma.album.count();
    const photoCount = await prisma.photo.count();
    const adminConfig = await getAdminConfig();

    return (
        <div className="max-w-4xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-nebula-500/20">
                    <Settings className="w-7 h-7 text-nebula-400" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white">Settings</h1>
                    <p className="text-gray-400 text-sm">Gallery configuration and system info</p>
                </div>
            </div>

            {/* Site Configuration */}
            <section className="glass-panel rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <Paintbrush className="w-5 h-5 text-nebula-400" />
                    <h2 className="text-lg font-semibold text-white">Site Customization</h2>
                </div>
                <TitleChangeForm currentTitle={adminConfig?.siteTitle || "Lunar Gallery"} />
            </section>

            {/* Admin Account */}
            <section className="glass-panel rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-5 h-5 text-nebula-400" />
                    <h2 className="text-lg font-semibold text-white">Admin Account</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard label="Logged in as" value={session.user.name || "Admin"} />
                    <InfoCard label="Email" value={session.user.email || "—"} />
                    <InfoCard label="Username" value={process.env.ADMIN_USERNAME || "admin"} />
                    <InfoCard label="Role" value="Administrator" />
                </div>
            </section>

            {/* Change Password */}
            <section className="glass-panel rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <KeyRound className="w-5 h-5 text-nebula-400" />
                    <h2 className="text-lg font-semibold text-white">Change Password</h2>
                </div>
                <PasswordChangeForm />
            </section>

            {/* Gallery Stats */}
            <section className="glass-panel rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <Image className="w-5 h-5 text-nebula-400" />
                    <h2 className="text-lg font-semibold text-white">Gallery Stats</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <StatCard icon={<FolderOpen className="w-5 h-5" />} label="Albums" value={albumCount} />
                    <StatCard icon={<Image className="w-5 h-5" />} label="Photos" value={photoCount} />
                    <StatCard icon={<User className="w-5 h-5" />} label="Users" value={1} />
                </div>
            </section>

            {/* Storage Info */}
            <section className="glass-panel rounded-2xl p-6 space-y-5">
                <div className="flex items-center gap-3 mb-2">
                    <Database className="w-5 h-5 text-nebula-400" />
                    <h2 className="text-lg font-semibold text-white">Storage</h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <InfoCard label="Database" value="SQLite" />
                    <InfoCard label="File" value="prisma/dev.db" />
                </div>
            </section>
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-black/30 rounded-xl px-4 py-3 border border-white/5">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
            <p className="text-white font-medium truncate">{value}</p>
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
    return (
        <div className="bg-black/30 rounded-xl px-5 py-4 border border-white/5 flex items-center gap-4">
            <div className="p-2 rounded-lg bg-nebula-500/15 text-nebula-400">
                {icon}
            </div>
            <div>
                <p className="text-2xl font-bold text-white">{value}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
            </div>
        </div>
    );
}
