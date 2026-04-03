import { Sparkles, Calendar, ExternalLink, ArrowRight } from "lucide-react";

interface Event {
    id: string;
    title: string;
    description: string | null;
    imageUrl: string | null;
    externalUrl: string | null;
    eventDate: Date | null;
}

interface CurrentEventsPanelProps {
    events: Event[];
}

export default function CurrentEventsPanel({ events }: CurrentEventsPanelProps) {
    if (events.length === 0) return null;

    return (
        <section className="w-full">
            {/* Full-width glassmorphism banner with pulsing nebula border */}
            <div className="relative rounded-2xl overflow-hidden animate-glow">
                {/* Inner panel */}
                <div className="glass-panel rounded-2xl border border-nebula-500/20 p-5 sm:p-6">
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-4">
                        <Sparkles className="w-5 h-5 text-nebula-400 flex-shrink-0" />
                        <h2 className="text-lg sm:text-xl font-bold text-white">Current Events</h2>
                    </div>

                    {/* Events list */}
                    <div className="space-y-0 divide-y divide-white/5">
                        {events.map((event, idx) => {
                            const formattedDate = event.eventDate
                                ? new Date(event.eventDate).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                })
                                : null;

                            const content = (
                                <div
                                    key={event.id}
                                    className={`flex items-start gap-3 sm:gap-4 group ${
                                        idx > 0 ? "pt-3 sm:pt-4" : ""
                                    } ${idx < events.length - 1 ? "pb-3 sm:pb-4" : ""} ${
                                        event.externalUrl
                                            ? "cursor-pointer"
                                            : ""
                                    }`}
                                >
                                    {/* Date badge — compact square on desktop */}
                                    {formattedDate && (
                                        <div className="flex-shrink-0 w-14 sm:w-16 text-center py-1.5 rounded-lg bg-nebula-500/10 border border-nebula-500/20">
                                            <p className="text-nebula-300 text-[10px] sm:text-xs font-medium uppercase leading-tight">
                                                {new Date(event.eventDate!).toLocaleDateString("en-US", { month: "short" })}
                                            </p>
                                            <p className="text-white text-lg sm:text-xl font-bold leading-tight">
                                                {new Date(event.eventDate!).getDate()}
                                            </p>
                                        </div>
                                    )}

                                    {/* Text content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-white font-semibold text-sm sm:text-base truncate group-hover:text-nebula-300 transition-colors">
                                                {event.title}
                                            </h3>
                                            {event.externalUrl && (
                                                <ExternalLink className="w-3.5 h-3.5 text-gray-500 group-hover:text-nebula-400 transition-colors flex-shrink-0" />
                                            )}
                                        </div>
                                        {event.description && (
                                            <p className="text-gray-400 text-xs sm:text-sm mt-0.5 line-clamp-1 sm:line-clamp-2 leading-relaxed">
                                                {event.description}
                                            </p>
                                        )}
                                    </div>

                                    {/* Arrow for linked events */}
                                    {event.externalUrl && (
                                        <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-nebula-400 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
                                    )}
                                </div>
                            );

                            if (event.externalUrl) {
                                return (
                                    <a
                                        key={event.id}
                                        href={event.externalUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block hover:bg-white/[0.02] transition-colors rounded-lg -mx-1 px-1"
                                    >
                                        {content}
                                    </a>
                                );
                            }

                            return content;
                        })}
                    </div>
                </div>
            </div>
        </section>
    );
}
