"use client";

import { useState, useEffect, useRef } from "react";
import { searchLocations, GeocodingResult } from "@/lib/geocoding";
import { Search, MapPin, Loader2 } from "lucide-react";
import { useLocations } from "@/hooks/useLocations";

interface LocationSearchProps {
    onAddRequireReplace: (location: GeocodingResult) => void;
}

export function LocationSearch({ onAddRequireReplace }: LocationSearchProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<GeocodingResult[]>([]);
    const [isSearching, setIsSearching] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const { locations, addLocation } = useLocations();
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (query.trim().length >= 2) {
                setIsSearching(true);
                try {
                    const res = await searchLocations(query);
                    setResults(res);
                    setIsOpen(true);
                } catch (err) {
                    console.error(err);
                } finally {
                    setIsSearching(false);
                }
            } else {
                setResults([]);
                setIsOpen(false);
            }
        }, 500); // 500ms debounce

        return () => clearTimeout(timer);
    }, [query]);

    const handleSelect = (loc: GeocodingResult) => {
        if (locations.length >= 6) {
            // 6件制限にかかる場合は入れ替えモーダルを呼ぶ
            onAddRequireReplace(loc);
        } else {
            addLocation(loc);
        }
        setQuery("");
        setIsOpen(false);
    };

    return (
        <div className="relative w-full max-w-md mx-auto z-30" ref={wrapperRef}>
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    {isSearching ? (
                        <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
                    ) : (
                        <Search className="h-5 w-5 text-zinc-400" />
                    )}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => {
                        if (results.length > 0) setIsOpen(true);
                    }}
                    placeholder="都市名で検索 (東京, London...)"
                    className="block w-full pl-12 pr-4 py-3 sm:py-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 shadow-sm transition-all focus:shadow-md"
                />
            </div>

            {isOpen && results.length > 0 && (
                <div className="absolute mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <ul className="max-h-80 overflow-y-auto p-2 no-scrollbar">
                        {results.map((loc) => {
                            const isAdded = locations.some((l) => l.id === loc.id);

                            return (
                                <li key={loc.id}>
                                    <button
                                        onClick={() => handleSelect(loc)}
                                        disabled={isAdded}
                                        className={`w-full text-left px-4 py-3 flex items-center gap-3 rounded-xl transition-colors ${isAdded
                                            ? "opacity-50 cursor-not-allowed bg-zinc-50 dark:bg-zinc-800/30"
                                            : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            }`}
                                    >
                                        <MapPin className="w-5 h-5 text-zinc-400 shrink-0" />
                                        <div className="flex flex-col overflow-hidden">
                                            <span className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                                                {loc.name}
                                            </span>
                                            <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
                                                {loc.admin1 ? `${loc.admin1}, ` : ""}{loc.country}
                                            </span>
                                        </div>
                                        {isAdded && (
                                            <span className="ml-auto text-xs font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded-md">
                                                追加済み
                                            </span>
                                        )}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {isOpen && query.trim().length >= 2 && results.length === 0 && !isSearching && (
                <div className="absolute mt-2 w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-6 text-center text-zinc-500 dark:text-zinc-400 animate-in fade-in slide-in-from-top-2">
                    見つかりませんでした
                </div>
            )}
        </div>
    );
}
