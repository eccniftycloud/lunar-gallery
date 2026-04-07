'use client'

import { useState } from 'react'
import { updateAiMode } from '@/app/lib/actions'
import { Cpu, CloudLightning } from 'lucide-react'
import { useToast } from '@/components/ui/ToastProvider'

export default function AiToggleForm({ currentMode }: { currentMode: string }) {
    const [isPending, setIsPending] = useState(false)
    const { addToast } = useToast()

    async function handleToggle(mode: 'local' | 'cloud') {
        if (mode === currentMode) return;
        
        setIsPending(true)
        const formData = new FormData()
        formData.append('mode', mode)

        try {
            const res = await updateAiMode(formData)
            if (res?.success) {
                addToast('AI engine updated successfully', 'success')
            } else {
                addToast('Failed to update AI engine', 'error')
            }
        } catch (error: any) {
            addToast(error.message || 'An error occurred', 'error')
        } finally {
            setIsPending(false)
        }
    }

    return (
        <div className="flex gap-4 items-center">
            <button
                disabled={isPending}
                onClick={() => handleToggle('local')}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    currentMode === 'local' 
                    ? 'bg-nebula-500/20 border-nebula-500/50 text-white shadow-[0_0_15px_rgba(168,85,247,0.2)]' 
                    : 'bg-black/20 border-white/5 text-gray-400 hover:bg-black/40 hover:text-white'
                }`}
            >
                <Cpu className={`w-8 h-8 mb-2 ${currentMode === 'local' ? 'text-nebula-400' : 'text-gray-500'}`} />
                <span className="font-medium text-lg">Local AI</span>
                <span className="text-xs opacity-70 mt-1">Ollama • Free • Slower</span>
            </button>

            <button
                disabled={isPending}
                onClick={() => handleToggle('cloud')}
                className={`flex-1 flex flex-col items-center justify-center p-4 rounded-xl border transition-all ${
                    currentMode === 'cloud' 
                    ? 'bg-blue-500/20 border-blue-500/50 text-white shadow-[0_0_15px_rgba(59,130,246,0.2)]' 
                    : 'bg-black/20 border-white/5 text-gray-400 hover:bg-black/40 hover:text-white'
                }`}
            >
                <CloudLightning className={`w-8 h-8 mb-2 ${currentMode === 'cloud' ? 'text-blue-400' : 'text-gray-500'}`} />
                <span className="font-medium text-lg">Cloud AI</span>
                <span className="text-xs opacity-70 mt-1">Bedrock • Paid • Faster</span>
            </button>
        </div>
    )
}
