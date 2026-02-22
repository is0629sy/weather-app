export interface GeocodingResult {
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string; // 都道府県・州など
}

export async function searchLocations(query: string, language: string = "ja"): Promise<GeocodingResult[]> {
    if (!query.trim()) return [];

    const params = new URLSearchParams({
        name: query,
        count: "10",
        language: language,
        format: "json",
    });

    const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params.toString()}`);
    if (!res.ok) {
        throw new Error("Failed to fetch geocoding data");
    }

    const data = await res.json();

    if (!data.results) {
        return [];
    }

    return data.results.map((item: GeocodingResult) => ({
        id: item.id,
        name: item.name,
        latitude: item.latitude,
        longitude: item.longitude,
        country: item.country,
        admin1: item.admin1,
    }));
}

export async function reverseGeocode(lat: number, lon: number, language: string = "ja"): Promise<GeocodingResult | null> {
    const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        language: language,
        format: "json",
    });

    // Open-MeteoのジオコーディングAPIには逆ジオコーディングがないため、
    // ここでは他の無料API（例: BigDataCloud or OpenStreetMap Nominatim）を検討するか、
    // あるいはOpen-Meteoの別エンドポイントを探す必要があります。
    // Open-Meteo自体に逆ジオコーディングはないため、代わりの無料APIである Nominatim を使用します。
    // ※商用利用や大量リクエストには注意が必要ですが、個人の練習用としては許容範囲です。

    try {
        const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=${language}`, {
            headers: {
                "User-Agent": "WeatherApp-Educational-Project"
            }
        });

        if (!res.ok) return null;

        const data = await res.json();
        if (!data || !data.address) return null;

        const name = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.province || "現在地";

        return {
            id: data.place_id || Date.now(),
            name: name,
            latitude: lat,
            longitude: lon,
            country: data.address.country || "不明",
            admin1: data.address.state || data.address.province,
        };
    } catch (err) {
        console.error("Reverse geocoding failed:", err);
        return null;
    }
}
