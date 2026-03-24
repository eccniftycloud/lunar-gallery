"use client";

import { ArrowUpDown, Clock, ArrowDownAZ } from "lucide-react";
import type { SortOption } from "@/app/lib/actions";

interface SortControlProps {
    currentSort: SortOption;
    onSortChange: (sort: SortOption) => void;
}

const sortOptions: { value: SortOption; label: string; icon: typeof Clock }[] = [
    { value: "newest", label: "Newest", icon: Clock },
    { value: "oldest", label: "Oldest", icon: Clock },
    { value: "name", label: "A → Z", icon: ArrowDownAZ },
];

export default function SortControl({ currentSort, onSortChange }: SortControlProps) {
    return (
        <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <div className="flex gap-1 glass-panel rounded-lg p-1">
                {sortOptions.map((opt) => {
                    const Icon = opt.icon;
                    const isActive = currentSort === opt.value;
                    return (
                        <button
                            key={opt.value}
                            onClick={() => onSortChange(opt.value)}
                            className={`
                                flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium
                                transition-all duration-200
                                ${isActive
                                    ? "bg-nebula-500/20 text-nebula-300 border border-nebula-500/30"
                                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                                }
                            `}
                            id={`sort-${opt.value}`}
                        >
                            <Icon className="w-3 h-3" />
                            {opt.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
