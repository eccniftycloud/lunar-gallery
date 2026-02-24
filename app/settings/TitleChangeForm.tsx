"use client";

import { useState } from "react";
import { updateSiteTitle } from "@/app/lib/actions";
import { Loader2, Check, AlertCircle } from "lucide-react";
import { useFormStatus } from "react-dom";

export default function TitleChangeForm({ currentTitle }: { currentTitle: string }) {
    const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

    async function handleSubmit(formData: FormData) {
        setMessage(null);
        try {
            const result = await updateSiteTitle(formData);
            if (result.success) {
                setMessage({ text: "Title updated successfully!", type: "success" });
            } else {
                setMessage({ text: "Failed to update title.", type: "error" });
            }
        } catch (error) {
            setMessage({ text: String(error), type: "error" });
        }
    }

    return (
        <form action={handleSubmit} className="space-y-4 max-w-md">
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">
                    Site Title
                </label>
                <input
                    type="text"
                    name="title"
                    id="title"
                    defaultValue={currentTitle}
                    placeholder="Lunar Gallery"
                    className="w-full bg-black/30 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-nebula-500 transition-colors"
                />
            </div>

            {message && (
                <div className={`p-3 rounded-lg flex items-center gap-2 text-sm ${message.type === "success" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    }`}>
                    {message.type === "success" ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                    {message.text}
                </div>
            )}

            <SubmitButton />
        </form>
    );
}

function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="px-4 py-2 bg-nebula-600 hover:bg-nebula-500 text-white rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
        >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Title
        </button>
    );
}
