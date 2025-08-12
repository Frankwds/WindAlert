import { getCacheKey, readCache, writeCache } from './cache';

export const API_URL_CONFIG = {
    openMeteo: {
        baseURL: "https://api.open-meteo.com/v1/forecast",
        params: {
            wind_speed_unit: "ms",
            hourly: [
                "wind_speed_1000hPa", "wind_direction_1000hPa",
                "wind_direction_925hPa", "wind_speed_925hPa",
                "wind_speed_850hPa", "wind_direction_850hPa",
                "wind_direction_700hPa", "wind_speed_700hPa",
                "temperature_1000hPa", "temperature_925hPa",
                "temperature_850hPa", "temperature_700hPa",
                "temperature_2m", "precipitation",
                "precipitation_probability", "cloud_cover",
                "wind_speed_10m", "wind_direction_10m",
                "wind_gusts_10m", "weather_code",
                "pressure_msl", "convective_inhibition",
                "cloud_cover_low", "cloud_cover_mid",
                "cloud_cover_high", "is_day",
                "freezing_level_height", "cape",
                "lifted_index", "boundary_layer_height",
                "geopotential_height_1000hPa", "geopotential_height_925hPa",
                "geopotential_height_850hPa", "geopotential_height_700hPa",
            ].join(','),
            forecast_days: "3",
            models: "best_match",
            timezone: "auto"
        }
    },
    yr: {
        baseURL: "https://api.met.no/weatherapi/locationforecast/2.0/complete"
    }
};

export async function fetchMeteoData(latitude: number | number[], longitude: number | number[]): Promise<any> {
    const { baseURL, params } = API_URL_CONFIG.openMeteo;
    const url = new URL(baseURL);

    const latString = Array.isArray(latitude) ? latitude.join(',') : latitude.toString();
    const lonString = Array.isArray(longitude) ? longitude.join(',') : longitude.toString();

    url.searchParams.append('latitude', latString);
    url.searchParams.append('longitude', lonString);

    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch weather data for ${latString},${lonString}: ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch weather data`);
    }

    return response.json();
}

export async function fetchYrData(latitude: number, longitude: number): Promise<any> {
    const lat = latitude.toFixed(4);
    const lon = longitude.toFixed(4);
    const url = `${API_URL_CONFIG.yr.baseURL}?lat=${lat}&lon=${lon}`;
    const cacheKey = getCacheKey(latitude, longitude);
    const cachedData = await readCache(cacheKey);

    const headers: HeadersInit = {
        'User-Agent': 'paragliding-weather-app/1.0 (https://github.com/BerriJ/paragliding-weather-app)',
    };

    if (cachedData) {
        if (cachedData.expires && new Date(cachedData.expires) > new Date()) {
            console.log(`Cache hit for ${cacheKey}`);
            return cachedData.data;
        }
        console.log(`Cache expired for ${cacheKey}`);
        if (cachedData.last_modified) {
            headers['If-Modified-Since'] = cachedData.last_modified;
        }
    } else {
        console.log(`Cache miss for ${cacheKey}`);
    }

    const response = await fetch(url, { headers });

    if (response.status === 304) {
        console.log(`304 Not Modified for ${cacheKey}. Returning stale data.`);
        if (cachedData) {
            // Update expires header in cache and return old data
            await writeCache(cacheKey, cachedData.data, response.headers);
            return cachedData.data;
        } else {
            // This case should ideally not happen. If we get 304, we must have sent If-Modified-Since,
            // which means we had cachedData. But as a fallback, refetch.
            return fetchYrData(latitude, longitude);
        }
    }

    if (response.status === 429) {
        console.warn(`Rate limited for ${cacheKey}. Returning stale data if available.`);
        if (cachedData) {
            return cachedData.data;
        }
        throw new Error(`Failed to fetch weather data: Rate limited and no cache available.`);
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch weather data for ${latitude},${longitude}: ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch weather data`);
    }

    const newJsonData = await response.json();
    await writeCache(cacheKey, newJsonData, response.headers);

    console.log(`Fetched new data for ${cacheKey}`);
    return newJsonData;
}
