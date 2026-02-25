export interface WeatherData {
    current: {
        time: string;
        temperature2m: number;
        relativeHumidity2m: number;
        weatherCode: number;
        windSpeed10m: number;
        precipitation: number;
        pressure: number;
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
    const API_KEY = process.env.OPENWEATHER_API_KEY;
    if (!API_KEY) {
        console.error("OpenWeatherMap API key is missing. Please check your .env.local file.");
        throw new Error("OpenWeatherMap API key is not configured");
    }

    try {
        // One Call API 3.0 is recommended, but 2.5 is also common.
        // Here we use current weather and 5 day forecast as a fallback if One Call is not accessible.
        // However, to keep it simple and fulfill the requirement, we will try to fetch both.

        // Fetch Current Weather
        const currentRes = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`
        );
        if (!currentRes.ok) {
            const errorData = await currentRes.json().catch(() => ({}));
            console.error("OpenWeatherMap Current API Error:", currentRes.status, errorData);
            throw new Error(`Failed to fetch current weather: ${currentRes.status}`);
        }
        const currentData = await currentRes.json();

        // Fetch 5 Day / 3 Hour Forecast
        const forecastRes = await fetch(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&lang=ja`
        );
        if (!forecastRes.ok) {
            const errorData = await forecastRes.json().catch(() => ({}));
            console.error("OpenWeatherMap Forecast API Error:", forecastRes.status, errorData);
            throw new Error(`Failed to fetch forecast data: ${forecastRes.status}`);
        }
        const forecastData = await forecastRes.json();

        // Process daily data (group by date)
        const dailyMap = new Map();
        forecastData.list.forEach((item: any) => {
            const date = item.dt_txt.split(" ")[0];
            const time = item.dt_txt.split(" ")[1]; // "HH:mm:ss"

            if (!dailyMap.has(date)) {
                dailyMap.set(date, {
                    tempMax: item.main.temp_max,
                    tempMin: item.main.temp_min,
                    weatherCode: item.weather[0].id,
                    pop: item.pop || 0,
                    representativeTime: time
                });
            } else {
                const entry = dailyMap.get(date);
                entry.tempMax = Math.max(entry.tempMax, item.main.temp_max);
                entry.tempMin = Math.min(entry.tempMin, item.main.temp_min);
                entry.pop = Math.max(entry.pop, item.pop || 0);

                // 日中（12時〜15時）の天気を優先的に代表値として採用する
                const hour = parseInt(time.split(":")[0]);
                const currentRepHour = parseInt(entry.representativeTime.split(":")[0]);

                // 12時に近い方を優先
                if (Math.abs(hour - 12) < Math.abs(currentRepHour - 12)) {
                    entry.weatherCode = item.weather[0].id;
                    entry.representativeTime = time;
                }
            }
        });

        const dailyDates = Array.from(dailyMap.keys()).slice(0, 5);
        const dailyTempsMax = dailyDates.map(d => dailyMap.get(d).tempMax);
        const dailyTempsMin = dailyDates.map(d => dailyMap.get(d).tempMin);
        const dailyCodes = dailyDates.map(d => dailyMap.get(d).weatherCode);
        const dailyPops = dailyDates.map(d => dailyMap.get(d).pop * 100);

        return {
            current: {
                time: new Date(currentData.dt * 1000).toISOString(),
                temperature2m: currentData.main.temp,
                relativeHumidity2m: currentData.main.humidity,
                weatherCode: currentData.weather[0].id,
                windSpeed10m: currentData.wind.speed,
                precipitation: currentData.rain ? (currentData.rain["1h"] || 0) : 0,
                pressure: currentData.main.pressure,
            },
            daily: {
                time: dailyDates,
                weatherCode: dailyCodes,
                temperature2mMax: dailyTempsMax,
                temperature2mMin: dailyTempsMin,
                precipitationProbabilityMax: dailyPops,
            },
            hourly: {
                time: forecastData.list.map((item: any) => item.dt_txt),
                temperature2m: forecastData.list.map((item: any) => item.main.temp),
                weatherCode: forecastData.list.map((item: any) => item.weather[0].id),
            },
        };
    } catch (error) {
        console.error("fetchWeather error:", error);
        throw error;
    }
}
