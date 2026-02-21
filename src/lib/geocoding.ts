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
