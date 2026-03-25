"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, XCircle, Info, X, Sparkles } from "lucide-react";

// --- Types ---
type ToastType = "success" | "error" | "info";

interface Toast {
    id: string;
    message: string;
    type: ToastType;
}

interface ToastContextType {
    addToast: (message: string, type?: ToastType) => void;
}

// --- Context ---
const ToastContext = createContext<ToastContextType | null>(null);

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}

// --- Icons & Colors ---
const toastConfig: Record<ToastType, { Icon: typeof CheckCircle2; gradient: string; border: string; iconColor: string }> = {
    success: {
        Icon: CheckCircle2,
        gradient: "from-emerald-500/20 to-emerald-900/10",
        border: "border-emerald-500/30",
        iconColor: "text-emerald-400",
    },
    error: {
        Icon: XCircle,
        gradient: "from-red-500/20 to-red-900/10",
        border: "border-red-500/30",
        iconColor: "text-red-400",
    },
    info: {
        Icon: Sparkles,
        gradient: "from-nebula-500/20 to-purple-900/10",
        border: "border-nebula-500/30",
        iconColor: "text-nebula-400",
    },
};

// --- Provider ---
export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);

    const addToast = useCallback((message: string, type: ToastType = "success") => {
        const id = crypto.randomUUID();
        setToasts((prev) => [...prev, { id, message, type }]);

        // Auto-dismiss after 4 seconds
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 4000);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    return (
        <ToastContext.Provider value={{ addToast }}>
            {children}

            {/* Toast Container — fixed bottom-right */}
            <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-3 pointer-events-none">
                <AnimatePresence mode="popLayout">
                    {toasts.map((toast) => {
                        const { Icon, gradient, border, iconColor } = toastConfig[toast.type];
                        return (
                            <motion.div
                                key={toast.id}
                                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, x: 80, scale: 0.9 }}
                                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                                className={`
                                    pointer-events-auto flex items-center gap-3 
                                    px-4 py-3 rounded-xl
                                    bg-gradient-to-r ${gradient}
                                    backdrop-blur-xl border ${border}
                                    shadow-lg shadow-black/30
                                    min-w-[280px] max-w-[400px]
                                `}
                            >
                                <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
                                <p className="text-sm text-white/90 flex-1">{toast.message}</p>
                                <button
                                    onClick={() => removeToast(toast.id)}
                                    className="p-1 rounded-lg hover:bg-white/10 text-gray-500 hover:text-white transition-colors flex-shrink-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>
        </ToastContext.Provider>
    );
}
