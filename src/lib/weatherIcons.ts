import {
    Sun,
    CloudSun,
    Cloud,
    CloudFog,
    CloudDrizzle,
    CloudRain,
    CloudSnow,
    CloudLightning,
    HelpCircle,
} from "lucide-react";

export function getWeatherIcon(code: number) {
    // OpenWeatherMap ID ranges
    if (code >= 200 && code < 300) return CloudLightning; // Thunderstorm
    if (code >= 300 && code < 400) return CloudDrizzle;   // Drizzle
    if (code >= 500 && code < 600) return CloudRain;      // Rain
    if (code >= 600 && code < 700) return CloudSnow;      // Snow
    if (code >= 700 && code < 800) return CloudFog;       // Atmosphere (Fog, Mist, etc)
    if (code === 800) return Sun;                         // Clear
    if (code === 801 || code === 802) return CloudSun;    // Few/Scattered clouds
    if (code === 803 || code === 804) return Cloud;       // Broken/Overcast clouds

    return HelpCircle; // Unknown
}

export function getWeatherDescription(code: number): string {
    if (code >= 200 && code < 300) return "雷雨";
    if (code >= 300 && code < 400) return "霧雨";
    if (code >= 500 && code < 600) return "雨";
    if (code >= 600 && code < 700) return "雪";
    if (code >= 700 && code < 800) return "霧";
    if (code === 800) return "快晴";
    if (code >= 801 && code <= 804) return "曇り";
    return "不明";
}

export function getWeatherColor(code: number): string {
    if (code >= 200 && code < 300) return "text-indigo-500 dark:text-indigo-400"; // Thunderstorm
    if (code >= 300 && code < 400) return "text-sky-400 dark:text-sky-300";      // Drizzle
    if (code >= 500 && code < 600) return "text-blue-500 dark:text-blue-400";    // Rain
    if (code >= 600 && code < 700) return "text-cyan-400 dark:text-cyan-300";    // Snow
    if (code >= 700 && code < 800) return "text-slate-400 dark:text-slate-500";  // Atmosphere
    if (code === 800) return "text-amber-500 dark:text-amber-400";              // Clear
    if (code >= 801 && code <= 802) return "text-amber-400 dark:text-amber-300"; // Few clouds
    if (code >= 803 && code <= 804) return "text-zinc-500 dark:text-zinc-400";   // Overcast

    return "text-zinc-400 dark:text-zinc-500"; // Unknown
}
