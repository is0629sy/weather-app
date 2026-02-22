/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState } from "react";
import { fetchWeather, WeatherData } from "@/lib/weather";
import { getWeatherIcon, getWeatherDescription, getWeatherColor } from "@/lib/weatherIcons";
import { Location } from "@/hooks/useLocations";
import { Droplets, Wind, X, GripVertical } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ja } from "date-fns/locale";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
interface WeatherCardProps {
    location: Location;
    onRemove: (id: number) => void;
    onClick: (location: Location, weather: WeatherData) => void;
}

export function WeatherCard({ location, onRemove, onClick }: WeatherCardProps) {
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let mounted = true;
        fetchWeather(location.latitude, location.longitude)
            .then((data) => {
                if (mounted) {
                    setWeather(data);
                    setError(false);
                }
            })
            .catch((err) => {
                console.error(err);
                if (mounted) setError(true);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });
        return () => {
            mounted = false;
        };
    }, [location.latitude, location.longitude]);

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: location.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 20 : 1,
        opacity: isDragging ? 0.8 : 1,
    };

    if (loading) {
        return (
            <div ref={setNodeRef} style={style} className="h-auto min-h-[16rem] rounded-2xl bg-white/50 dark:bg-zinc-800/50 p-5 sm:p-6 shadow-sm border border-zinc-200 dark:border-zinc-700 animate-pulse" />
        );
    }

    if (error || !weather) {
        return (
            <div ref={setNodeRef} style={style} className="h-auto min-h-[16rem] flex items-center justify-center rounded-2xl bg-red-50 dark:bg-red-900/10 p-5 sm:p-6 text-red-500 border border-red-200 dark:border-red-900 relative">
                データの取得に失敗しました
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onRemove(location.id);
                    }}
                    className="absolute top-4 right-4 p-1 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>
        );
    }

    const { current, daily } = weather;
    const CurrentIcon = getWeatherIcon(current.weatherCode);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`relative group ${isDragging ? "z-50" : "z-10"}`}
        >
            <div
                className={`h-full rounded-2xl bg-white dark:bg-zinc-900 p-5 sm:p-6 shadow-md border border-zinc-200 dark:border-zinc-800 hover:shadow-lg transition-all ${!isDragging ? "hover:-translate-y-1" : ""} cursor-pointer`}
                onClick={() => onClick(location, weather)}
            >
                {/* ヘッダー: 都市名、ドラッグハンドル、削除ボタン */}
                <div className="flex justify-between items-start mb-4 gap-2">
                    <div className="flex items-start gap-3">
                        {/* ドラッグハンドル */}
                        <div
                            {...attributes}
                            {...listeners}
                            className="p-1 -ml-1 rounded-md cursor-grab active:cursor-grabbing text-zinc-300 hover:text-zinc-500 dark:text-zinc-600 dark:hover:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            onClick={(e) => e.stopPropagation()}
                            aria-label="ドラッグして並べ替え"
                        >
                            <GripVertical className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
                                {location.name}
                            </h2>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                {location.country} {location.admin1 ? `, ${location.admin1}` : ""}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onRemove(location.id);
                        }}
                        className="p-2 sm:p-1 rounded-full opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-all focus:opacity-100"
                        aria-label="削除"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* 現在の天気 */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <CurrentIcon className={`w-12 h-12 ${getWeatherColor(current.weatherCode)}`} />
                        <div>
                            <div className="text-3xl sm:text-4xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tighter">
                                {Math.round(current.temperature2m)}°
                            </div>
                            <div className="text-sm text-zinc-600 dark:text-zinc-400">
                                {getWeatherDescription(current.weatherCode)}
                            </div>
                        </div>
                    </div>
                    <div className="text-right text-sm text-zinc-500 dark:text-zinc-400 space-y-1">
                        <div className="flex items-center justify-end gap-1">
                            <Droplets className="w-4 h-4" />
                            <span>{current.relativeHumidity2m}%</span>
                        </div>
                        <div className="flex items-center justify-end gap-1">
                            <Wind className="w-4 h-4" />
                            <span>{Math.round(current.windSpeed10m * 10) / 10}m/s</span>
                        </div>
                    </div>
                </div>

                {/* 週間予報 (直近3日程度を表示) */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-4 gap-2">
                    {daily.time.slice(1, 5).map((dateStr, index) => {
                        // index 0は今日の予報になるため、明日の予報(1)から4日分を取り出す
                        const DailyIcon = getWeatherIcon(daily.weatherCode[index + 1]);
                        const date = parseISO(dateStr);
                        const isTomorrow = index === 0;

                        return (
                            <div key={dateStr} className="flex flex-col items-center text-xs">
                                <span className="text-zinc-500 dark:text-zinc-400 mb-1">
                                    {isTomorrow ? "明日" : format(date, "E", { locale: ja })}
                                </span>
                                <DailyIcon className={`w-5 h-5 mb-1 ${getWeatherColor(daily.weatherCode[index + 1])}`} />
                                <div className="flex flex-col items-center">
                                    <span className="font-semibold text-zinc-900 dark:text-zinc-50">
                                        {Math.round(daily.temperature2mMax[index + 1])}°
                                    </span>
                                    <span className="text-zinc-400 dark:text-zinc-500">
                                        {Math.round(daily.temperature2mMin[index + 1])}°
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
