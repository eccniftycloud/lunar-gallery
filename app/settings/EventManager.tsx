"use client";

import { useState } from "react";
import { createEvent, toggleEvent, deleteEvent } from "@/app/lib/actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/ToastProvider";
import { Plus, Trash2, Eye, EyeOff, ExternalLink, Calendar, X } from "lucide-react";

interface Event {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    externalUrl: string | null;
    eventDate: Date | null;
    active: boolean;
}

interface EventManagerProps {
    events: Event[];
}

export default function EventManager({ events }: EventManagerProps) {
    const router = useRouter();
    const { addToast } = useToast();
    const [showForm, setShowForm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleCreate = async (formData: FormData) => {
        setIsSubmitting(true);
        try {
            await createEvent(formData);
            addToast("Event created!", "success");
            setShowForm(false);
            router.refresh();
        } catch (err) {
            console.error(err);
            addToast("Failed to create event", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggle = async (id: string, currentActive: boolean) => {
        try {
            await toggleEvent(id);
            addToast(currentActive ? "Event hidden from homepage" : "Event visible on homepage", "info");
            router.refresh();
        } catch (err) {
            console.error(err);
            addToast("Failed to toggle event", "error");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this event?")) return;
        try {
            await deleteEvent(id);
            addToast("Event deleted", "success");
            router.refresh();
        } catch (err) {
            console.error(err);
            addToast("Failed to delete event", "error");
        }
    };

    return (
        <div className="space-y-4">
            {/* Existing events list */}
            {events.length > 0 ? (
                <div className="space-y-2">
                    {events.map((event) => (
                        <div
                            key={event.id}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all ${
                                event.active
                                    ? "bg-black/30 border-white/10"
                                    : "bg-black/20 border-white/5 opacity-60"
                            }`}
                        >
                            {/* Thumbnail */}
                            {event.imageUrl ? (
                                <img
                                    src={event.imageUrl}
                                    alt={event.title}
                                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-lg bg-nebula-500/15 flex items-center justify-center flex-shrink-0">
                                    <Calendar className="w-4 h-4 text-nebula-400" />
                                </div>
                            )}

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="text-white text-sm font-medium truncate">{event.title}</p>
                                <p className="text-gray-500 text-xs truncate">
                                    {event.eventDate
                                        ? new Date(event.eventDate).toLocaleDateString()
                                        : "No date"}
                                    {event.externalUrl && " • Has link"}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                                <button
                                    onClick={() => handleToggle(event.id, event.active)}
                                    className={`p-1.5 rounded-lg transition-colors ${
                                        event.active
                                            ? "text-green-400 hover:bg-green-500/15"
                                            : "text-gray-500 hover:bg-white/10"
                                    }`}
                                    title={event.active ? "Hide from homepage" : "Show on homepage"}
                                >
                                    {event.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => handleDelete(event.id)}
                                    className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15 transition-colors"
                                    title="Delete"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-gray-500 text-sm text-center py-4">
                    No events yet. Add one to show it on the homepage.
                </p>
            )}

            {/* Add button / form */}
            {!showForm ? (
                <button
                    onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-nebula-500/15 text-nebula-300 hover:bg-nebula-500/25 transition-colors text-sm font-medium w-full justify-center"
                >
                    <Plus className="w-4 h-4" />
                    Add Event
                </button>
            ) : (
                <form
                    action={handleCreate}
                    className="space-y-3 p-4 rounded-xl bg-black/40 border border-white/10"
                >
                    <div className="flex items-center justify-between">
                        <p className="text-white text-sm font-medium">New Event</p>
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <input
                        name="title"
                        placeholder="Event title (e.g. Artemis III Launch)"
                        required
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-nebula-500 placeholder:text-gray-600"
                    />

                    <textarea
                        name="description"
                        placeholder="Short description..."
                        rows={2}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-nebula-500 resize-none placeholder:text-gray-600"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">Event Date</label>
                            <input
                                name="eventDate"
                                type="date"
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-nebula-500 [color-scheme:dark]"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 block mb-1">External URL (optional)</label>
                            <input
                                name="externalUrl"
                                type="url"
                                placeholder="https://..."
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-nebula-500 placeholder:text-gray-600"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 block mb-1">Cover Image (optional)</label>
                        <input
                            name="imageFile"
                            type="file"
                            accept="image/*"
                            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-nebula-500 file:mr-3 file:bg-nebula-500/20 file:border-0 file:text-nebula-300 file:text-xs file:px-3 file:py-1 file:rounded-md file:cursor-pointer"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full px-4 py-2.5 rounded-xl bg-nebula-500/20 text-nebula-300 hover:bg-nebula-500/30 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                        {isSubmitting ? "Creating..." : "Create Event"}
                    </button>
                </form>
            )}
        </div>
    );
}
