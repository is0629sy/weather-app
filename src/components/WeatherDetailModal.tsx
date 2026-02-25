"use client";

import { useEffect } from "react";
import { Location } from "@/hooks/useLocations";
import { WeatherData } from "@/lib/weather";
import { getWeatherIcon, getWeatherColor } from "@/lib/weatherIcons";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { X, Gauge, Droplets, Wind, Thermometer } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface WeatherDetailModalProps {
    location: Location | null;
    weather: WeatherData | null;
    isOpen: boolean;
    onClose: () => void;
    showAddButton?: boolean;
    onAdd?: (location: Location) => void;
}

export function WeatherDetailModal({
    location,
    weather,
    isOpen,
    onClose,
    showAddButton,
    onAdd,
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

    const now = new Date();
    // 未来の予報のみを抽出（24時間分 = 3時間間隔で8個）
    const hourlyData = weather.hourly.time
        .map((timeStr, i) => ({
            time: timeStr,
            temp: weather.hourly.temperature2m[i],
            code: weather.hourly.weatherCode[i],
        }))
        .filter((item) => new Date(item.time) > now)
        .slice(0, 8);

    // 日付ごとにグループ化
    const groupedHourly: { [key: string]: { time: string; temp: number; code: number }[] } = {};
    hourlyData.forEach(item => {
        const dateKey = format(parseISO(item.time), "yyyy-MM-dd");
        if (!groupedHourly[dateKey]) {
            groupedHourly[dateKey] = [];
        }
        groupedHourly[dateKey].push(item);
    });

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
                                {format(now, "yyyy年M月d日 (E)", { locale: ja })} の気象状況
                            </p>
                        </div>

                        {/* 現在の状況詳細 */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                                    <Thermometer className="w-4 h-4" />
                                    <span className="text-sm font-medium">気温</span>
                                </div>
                                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                    {Math.round(weather.current.temperature2m)}°
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                                    <Droplets className="w-4 h-4" />
                                    <span className="text-sm font-medium">湿度</span>
                                </div>
                                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                    {weather.current.relativeHumidity2m}%
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                                    <Wind className="w-4 h-4" />
                                    <span className="text-sm font-medium">風速</span>
                                </div>
                                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                    {Math.round(weather.current.windSpeed10m * 10) / 10} m/s
                                </div>
                            </div>
                            <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-700/50">
                                <div className="flex items-center gap-2 text-zinc-500 dark:text-zinc-400 mb-1">
                                    <Gauge className="w-4 h-4" />
                                    <span className="text-sm font-medium">気圧</span>
                                </div>
                                <div className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                    {weather.current.pressure} hPa
                                </div>
                            </div>
                        </div>

                        <div className="mb-4">
                            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">24時間予報</h3>
                        </div>

                        <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar snap-x">
                            {Object.entries(groupedHourly).map(([dateKey, items]) => (
                                <div key={dateKey} className="flex flex-col gap-2 min-w-max">
                                    <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 px-2 uppercase tracking-wider">
                                        {format(parseISO(dateKey), "M/d (E)", { locale: ja })}
                                    </span>
                                    <div className="flex border border-zinc-200 dark:border-zinc-700/50 bg-zinc-50 dark:bg-zinc-800/50 rounded-2xl overflow-hidden shadow-sm">
                                        {items.map((data, idx) => {
                                            const date = parseISO(data.time);
                                            const Icon = getWeatherIcon(data.code);

                                            return (
                                                <div
                                                    key={data.time}
                                                    className={`flex flex-col items-center justify-between min-w-[80px] p-4 snap-start shrink-0 ${idx !== 0 ? "border-l border-zinc-200/60 dark:border-zinc-700/30" : ""
                                                        }`}
                                                >
                                                    <span className="text-sm mb-3 text-zinc-500 dark:text-zinc-400">
                                                        {format(date, "H:mm")}
                                                    </span>
                                                    <Icon className={`w-8 h-8 mb-3 ${getWeatherColor(data.code)}`} />
                                                    <span className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                                                        {Math.round(data.temp)}°
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-between gap-4">
                            {showAddButton && location && onAdd && (
                                <button
                                    onClick={() => onAdd(location)}
                                    className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition-colors"
                                >
                                    この地点を追加する
                                </button>
                            )}
                            <button
                                onClick={onClose}
                                className="px-6 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 text-white rounded-full font-medium transition-colors ml-auto"
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
