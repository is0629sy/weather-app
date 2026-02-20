"use client";

import { Location } from "@/hooks/useLocations";
import { GeocodingResult } from "@/lib/geocoding";
import { MapPin, X, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ReplaceLocationDialogProps {
    isOpen: boolean;
    newLocation: GeocodingResult | null;
    existingLocations: Location[];
    onReplace: (oldId: number, newLoc: GeocodingResult) => void;
    onCancel: () => void;
}

export function ReplaceLocationDialog({
    isOpen,
    newLocation,
    existingLocations,
    onReplace,
    onCancel,
}: ReplaceLocationDialogProps) {
    if (!isOpen || !newLocation) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCancel}
                        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
                        animate={{ opacity: 1, scale: 1, y: "-50%", x: "-50%" }}
                        exit={{ opacity: 0, scale: 0.95, y: "-50%", x: "-50%" }}
                        className="fixed top-1/2 left-1/2 z-[60] w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl overflow-hidden"
                    >
                        <div className="p-6 md:p-8">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                        登録上限 (6件) に達しています
                                    </h3>
                                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
                                        「{newLocation.name}」を追加するためには、既存の地点のいずれかを入れ替える必要があります。
                                    </p>
                                </div>
                                <button
                                    onClick={onCancel}
                                    className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                                >
                                    <X className="w-5 h-5 text-zinc-500" />
                                </button>
                            </div>

                            <div className="flex flex-col gap-2 max-h-[50vh] overflow-y-auto no-scrollbar pr-2 mb-6">
                                {existingLocations.map((loc) => (
                                    <button
                                        key={loc.id}
                                        onClick={() => onReplace(loc.id, newLocation)}
                                        className="flex items-center justify-between p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 dark:hover:border-blue-500 transition-all group text-left"
                                    >
                                        <div className="flex items-center gap-3">
                                            <MapPin className="w-5 h-5 text-zinc-400 group-hover:text-blue-500" />
                                            <div>
                                                <div className="font-semibold text-zinc-900 dark:text-zinc-50">
                                                    {loc.name}
                                                </div>
                                                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                                                    {loc.admin1 ? `${loc.admin1}, ` : ""}{loc.country}
                                                </div>
                                            </div>
                                        </div>
                                        <ArrowRight className="w-5 h-5 text-zinc-300 dark:text-zinc-600 group-hover:text-blue-500 transform group-hover:translate-x-1 transition-all" />
                                    </button>
                                ))}
                            </div>

                            <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                <button
                                    onClick={onCancel}
                                    className="px-6 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-50 rounded-full font-medium transition-colors"
                                >
                                    キャンセル
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
