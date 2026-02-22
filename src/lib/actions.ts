"use server";

import { fetchWeather as fetchWeatherLib, WeatherData } from "./weather";
import { searchLocations as searchLocationsLib, reverseGeocode as reverseGeocodeLib, GeocodingResult } from "./geocoding";

export async function getWeatherAction(lat: number, lon: number): Promise<WeatherData> {
    return fetchWeatherLib(lat, lon);
}

export async function searchLocationsAction(query: string, limit: number = 10): Promise<GeocodingResult[]> {
    return searchLocationsLib(query, limit);
}

export async function reverseGeocodeAction(lat: number, lon: number, limit: number = 1): Promise<GeocodingResult | null> {
    return reverseGeocodeLib(lat, lon, limit);
}
