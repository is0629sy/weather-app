export interface WeatherData {
    current: {
        time: string;
        temperature2m: number;
        relativeHumidity2m: number;
        weatherCode: number;
        windSpeed10m: number;
        precipitation: number;
    };
    daily: {
        time: string[];
        weatherCode: number[];
        temperature2mMax: number[];
        temperature2mMin: number[];
        precipitationProbabilityMax: number[];
    };
    hourly: {
        time: string[];
        temperature2m: number[];
        weatherCode: number[];
    };
}

export async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
    const params = new URLSearchParams({
        latitude: lat.toString(),
        longitude: lon.toString(),
        current: "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,precipitation",
        hourly: "temperature_2m,weather_code",
        daily: "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max",
        timezone: "auto",
    });

    const res = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
    if (!res.ok) {
        throw new Error("Failed to fetch weather data");
    }

    const data = await res.json();

    return {
        current: {
            time: data.current.time,
            temperature2m: data.current.temperature_2m,
            relativeHumidity2m: data.current.relative_humidity_2m,
            weatherCode: data.current.weather_code,
            windSpeed10m: data.current.wind_speed_10m,
            precipitation: data.current.precipitation,
        },
        daily: {
            time: data.daily.time,
            weatherCode: data.daily.weather_code,
            temperature2mMax: data.daily.temperature_2m_max,
            temperature2mMin: data.daily.temperature_2m_min,
            precipitationProbabilityMax: data.daily.precipitation_probability_max,
        },
        hourly: {
            time: data.hourly.time,
            temperature2m: data.hourly.temperature_2m,
            weatherCode: data.hourly.weather_code,
        },
    };
}
