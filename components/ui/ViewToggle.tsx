"use client";

import { LayoutGrid, Columns3 } from "lucide-react";

export type ViewMode = "grid" | "masonry";

interface ViewToggleProps {
    currentView: ViewMode;
    onViewChange: (view: ViewMode) => void;
}

const viewOptions: { value: ViewMode; label: string; icon: typeof LayoutGrid }[] = [
    { value: "grid", label: "Grid", icon: LayoutGrid },
    { value: "masonry", label: "Flow", icon: Columns3 },
];

export default function ViewToggle({ currentView, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-1.5">
            <div className="flex gap-1 glass-panel rounded-lg p-1">
                {viewOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = currentView === opt.value;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onViewChange(opt.value)}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                                transition-all duration-200
                                ${isActive
                                    ? "bg-nebula-500/20 text-nebula-300 border border-nebula-500/30"
                                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                }
                            `}
                            id={`view-${opt.value}`}
                            title={opt.value === "grid" ? "Uniform square grid" : "Natural aspect ratio flow"}
                        >
                            <Icon className="w-3.5 h-3.5" />
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
