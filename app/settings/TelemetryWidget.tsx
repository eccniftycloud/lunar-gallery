'use client'

import { BarChart3, DatabaseZap } from "lucide-react"

export default function TelemetryWidget({ inputTokens, outputTokens }: { inputTokens: number, outputTokens: number }) {
    // Claude 3 Haiku Pricing per 1,000,000 tokens
    const INPUT_COST_PER_MILLION = 0.25;
    const OUTPUT_COST_PER_MILLION = 1.25;
    
    const estimatedCost = ((inputTokens / 1000000) * INPUT_COST_PER_MILLION) + ((outputTokens / 1000000) * OUTPUT_COST_PER_MILLION);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-black/30 rounded-xl px-5 py-4 border border-white/5 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-blue-500/15 text-blue-400">
                    <DatabaseZap className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">{inputTokens.toLocaleString()}</p>
                    <p className="text-xs text-blue-300/70 uppercase tracking-wider">Input Tokens</p>
                </div>
            </div>

            <div className="bg-black/30 rounded-xl px-5 py-4 border border-white/5 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-emerald-500/15 text-emerald-400">
                    <DatabaseZap className="w-5 h-5" />
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">{outputTokens.toLocaleString()}</p>
                    <p className="text-xs text-emerald-300/70 uppercase tracking-wider">Output Tokens</p>
                </div>
            </div>

            <div className="bg-black/30 rounded-xl px-5 py-4 border border-white/5 flex items-center gap-4">
                <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400">
                    <span className="text-lg font-bold select-none px-1">$</span>
                </div>
                <div>
                    <p className="text-2xl font-bold text-white">${estimatedCost.toFixed(5)}</p>
                    <p className="text-xs text-amber-300/70 uppercase tracking-wider">Est. AWS Cost</p>
                </div>
            </div>
        </div>
    )
}
