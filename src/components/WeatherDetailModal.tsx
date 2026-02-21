"use client";

import { useEffect } from "react";
import { Location } from "@/hooks/useLocations";
import { WeatherData } from "@/lib/weather";
import { getWeatherIcon } from "@/lib/weatherIcons";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WeatherDetailModalProps {
    location: Location | null;
    weather: WeatherData | null;
    isOpen: boolean;
    onClose: () => void;
}

export function WeatherDetailModal({
    location,
    weather,
    isOpen,
    onClose,
}: WeatherDetailModalProps) {
    // ESCキーで閉じる
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        if (isOpen) {
            document.addEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "hidden";
        }
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            document.body.style.overflow = "auto";
        };
    }, [isOpen, onClose]);

    if (!location || !weather) return null;

    // 現在時刻から24時間分のデータを抽出
    const now = new Date();
    const currentIndex = weather.hourly.time.findIndex(
        (timeStr) => new Date(timeStr) > now
    );

    // 過去すぎる場合は0から、そうでない場合は現在の時間前後から24件取得
    const startIndex = Math.max(0, currentIndex - 1);
    const hourlyData = weather.hourly.time
        .slice(startIndex, startIndex + 24)
        .map((timeStr, i) => ({
            time: timeStr,
            temp: weather.hourly.temperature2m[startIndex + i],
            code: weather.hourly.weatherCode[startIndex + i],
        }));

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, y: "100%", x: "-50%" }}
                        animate={{ opacity: 1, y: "-50%", x: "-50%" }}
                        exit={{ opacity: 0, y: "100%", x: "-50%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed top-1/2 left-1/2 z-50 w-[95vw] sm:w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl p-5 md:p-8"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-6 h-6 text-zinc-500" />
                        </button>

                        <div className="mb-8 pt-2 pr-10">
                            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">
                                {location.name}
                            </h2>
                            <p className="text-zinc-500 dark:text-zinc-400">
                                {format(now, "yyyy年M月d日 (E)", { locale: ja })} の24時間予報
                            </p>
                        </div>

                        <div className="relative">
                            <div className="flex gap-4 overflow-x-auto pb-6 no-scrollbar snap-x">
                                {hourlyData.map((data, idx) => {
                                    const date = parseISO(data.time);
                                    const Icon = getWeatherIcon(data.code);
                                    const isNow = idx === 0 && currentIndex > 0;

                                    return (
                                        <div
                                            key={data.time}
                                            className={`flex flex-col items-center justify-between min-w-[80px] p-4 rounded-2xl snap-start shrink-0 border ${isNow
                                                ? "bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800"
                                                : "bg-zinc-50 border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-700/50"
                                                }`}
                                        >
                                            <span className={`text-sm mb-3 ${isNow ? "text-blue-600 dark:text-blue-400 font-bold" : "text-zinc-500 dark:text-zinc-400"}`}>
                                                {isNow ? "現在" : format(date, "H:mm")}
                                            </span>
                                            <Icon className={`w-8 h-8 mb-3 ${isNow ? "text-blue-500" : "text-zinc-700 dark:text-zinc-300"}`} />
                                            <span className={`text-lg font-semibold ${isNow ? "text-blue-700 dark:text-blue-300" : "text-zinc-900 dark:text-zinc-50"}`}>
                                                {Math.round(data.temp)}°
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-full font-medium transition-colors"
                            >
                                閉じる
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
