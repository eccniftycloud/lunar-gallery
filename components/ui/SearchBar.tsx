"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { Search, X, Loader2 } from "lucide-react";
import { searchPhotos } from "@/app/lib/actions";
import PhotoCard from "./PhotoCard";

interface Photo {
    id: string;
    url: string;
    displayUrl: string | null;
    highResUrl: string | null;
    title: string | null;
    description: string | null;
    width: number | null;
    height: number | null;
    albumId: string | null;
}

interface Album {
    id: string;
    name: string;
}

interface SearchBarProps {
    isAdmin: boolean;
    albums: Album[];
}

export default function SearchBar({ isAdmin, albums }: SearchBarProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<Photo[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<NodeJS.Timeout | null>(null);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setIsSearching(true);
        try {
            const photos = (await searchPhotos(searchQuery)) as Photo[];
            setResults(photos);
            setHasSearched(true);
        } catch (error) {
            console.error("Search failed:", error);
        } finally {
            setIsSearching(false);
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setQuery(value);

        // Debounce search — wait 400ms after user stops typing
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            performSearch(value);
        }, 400);
    };

    const clearSearch = () => {
        setQuery("");
        setResults([]);
        setHasSearched(false);
        setIsOpen(false);
        inputRef.current?.blur();
    };

    const handleFocus = () => {
        setIsOpen(true);
    };

    // Close on Escape
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                clearSearch();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, []);

    return (
        <div className="relative w-full">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-r from-nebula-500/20 via-purple-500/20 to-nebula-500/20 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
                <div className="relative flex items-center glass-panel rounded-xl border border-white/5 group-focus-within:border-nebula-500/30 transition-all duration-300">
                    <Search className="w-5 h-5 text-gray-500 ml-4 flex-shrink-0 group-focus-within:text-nebula-400 transition-colors" />
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={handleInputChange}
                        onFocus={handleFocus}
                        placeholder="Search the cosmos... (title or description)"
                        className="w-full bg-transparent text-white placeholder-gray-500 px-4 py-3 outline-none text-sm"
                        id="search-input"
                    />
                    {isSearching && (
                        <Loader2 className="w-4 h-4 text-nebula-400 animate-spin mr-3 flex-shrink-0" />
                    )}
                    {query && !isSearching && (
                        <button
                            onClick={clearSearch}
                            className="p-1.5 mr-2 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors flex-shrink-0"
                            id="search-clear"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Search Results Overlay */}
            {isOpen && hasSearched && (
                <>
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                        onClick={clearSearch}
                    />

                    {/* Results Panel */}
                    <div className="absolute top-full left-0 right-0 mt-3 z-50 max-h-[70vh] overflow-y-auto glass-panel rounded-2xl border border-white/10 shadow-2xl shadow-black/50 animate-in fade-in slide-in-from-top-2 duration-200">
                        {results.length > 0 ? (
                            <div className="p-4">
                                <p className="text-sm text-gray-400 mb-4 px-1">
                                    Found <span className="text-nebula-400 font-semibold">{results.length}</span> result{results.length !== 1 ? "s" : ""} for &quot;{query}&quot;
                                </p>
                                <div className="columns-1 sm:columns-2 gap-4 space-y-4">
                                    {results.map((photo) => (
                                        <PhotoCard
                                            key={photo.id}
                                            id={photo.id}
                                            title={photo.title || undefined}
                                            description={photo.description || undefined}
                                            url={photo.url}
                                            displayUrl={photo.displayUrl || undefined}
                                            highResUrl={photo.highResUrl || undefined}
                                            width={photo.width || undefined}
                                            height={photo.height || undefined}
                                            albumId={photo.albumId}
                                            isAdmin={isAdmin}
                                            albums={albums}
                                        />
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="py-12 text-center">
                                <div className="text-4xl mb-3">🔭</div>
                                <p className="text-gray-400 text-sm">
                                    No celestial objects matched &quot;{query}&quot;
                                </p>
                                <p className="text-gray-600 text-xs mt-1">
                                    Try searching by photo title or description
                                </p>
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
