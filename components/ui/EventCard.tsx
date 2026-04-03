import { Calendar, ExternalLink } from "lucide-react";

interface EventCardProps {
    title: string;
    description?: string | null;
    imageUrl?: string | null;
    externalUrl?: string | null;
    eventDate?: Date | null;
}

export default function EventCard({ title, description, imageUrl, externalUrl, eventDate }: EventCardProps) {
    const formattedDate = eventDate
        ? new Date(eventDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : null;

    const Wrapper = externalUrl ? "a" : "div";
    const wrapperProps = externalUrl
        ? { href: externalUrl, target: "_blank", rel: "noopener noreferrer" }
        : {};

    return (
        <Wrapper
            {...wrapperProps}
            className={`group relative rounded-2xl overflow-hidden glass-panel border border-white/10 transition-all duration-300 ${
                externalUrl ? "hover:border-nebula-500/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.15)] cursor-pointer" : ""
            }`}
        >
            {/* Image or gradient placeholder */}
            <div className="relative aspect-[4/3] w-full overflow-hidden bg-gradient-to-br from-nebula-500/20 via-cosmic-800 to-lunar-500/20">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <Calendar className="w-12 h-12 text-nebula-500/30" />
                    </div>
                )}
                {/* Gradient overlay for text readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Date badge */}
                {formattedDate && (
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-xs text-nebula-300 font-medium flex items-center gap-1.5">
                        <Calendar className="w-3 h-3" />
                        {formattedDate}
                    </div>
                )}

                {/* External link indicator */}
                {externalUrl && (
                    <div className="absolute top-3 left-3 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm border border-white/10 text-gray-400 group-hover:text-nebula-300 transition-colors">
                        <ExternalLink className="w-3.5 h-3.5" />
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 space-y-1.5">
                <h3 className="text-white font-semibold text-sm line-clamp-1 group-hover:text-nebula-300 transition-colors">
                    {title}
                </h3>
                {description && (
                    <p className="text-gray-400 text-xs line-clamp-2 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
        </Wrapper>
    );
}
