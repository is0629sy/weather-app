export interface GeocodingResult {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string; // 都道府県・州など
}

const API_KEY = process.env.OPENWEATHER_API_KEY;

export async function searchLocations(query: string, limit: number = 10): Promise<GeocodingResult[]> {
    if (!query.trim() || !API_KEY) return [];

    const res = await fetch(
        `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(query)}&limit=${limit}&appid=${API_KEY}`
    );
    if (!res.ok) {
        throw new Error("Failed to fetch geocoding data");
    }

    const data = await res.json();

    return data.map((item: any, index: number) => ({
        id: index + Date.now(), // OpenWeatherMap doesn't provide a unique numeric ID in this API
        name: item.local_names?.ja || item.name,
        latitude: item.lat,
        longitude: item.lon,
        country: item.country,
        admin1: item.state,
    }));
}

export async function reverseGeocode(lat: number, lon: number, limit: number = 1): Promise<GeocodingResult | null> {
    try {
        // OpenWeatherMapの逆ジオコーディングよりも詳細な地名が得られるNominatimを使用します
        const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ja`,
            {
                headers: {
                    "User-Agent": "WeatherApp-Educational-Project/1.0"
                }
            }
        );

        if (!res.ok) return null;

        const data = await res.json();
        if (!data || !data.address) return null;

        // 市区町村名、あるいはそれに準ずる詳細な地名を優先的に取得
        const name = data.address.city ||
            data.address.town ||
            data.address.village ||
            data.address.suburb ||
            data.address.neighbourhood ||
            data.address.province ||
            "現在地";

        return {
            id: data.place_id || Date.now(),
            name: name,
            latitude: lat,
            longitude: lon,
            country: data.address.country || "日本",
            admin1: data.address.state || data.address.province,
        };
    } catch (err) {
        console.error("Reverse geocoding failed:", err);
        return null;
    }
}
