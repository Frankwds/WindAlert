import { API_CONFIG, KEY_MAP } from '../config/api';
import { openMeteoResponseSchema } from '../lib/validation';
import { WeatherDataPoint } from '../types';

export async function fetchWeatherData(latitude: number, longitude: number): Promise<any> {
    const { baseURL, params } = API_CONFIG.openMeteo;
    const url = new URL(baseURL);
    url.searchParams.append('latitude', latitude.toString());
    url.searchParams.append('longitude', longitude.toString());
    Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const response = await fetch(url.toString());

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch weather data for ${latitude},${longitude}: ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch weather data`);
    }
    // The 1-second delay is a temporary measure to avoid rate limiting.
    // A more robust solution (e.g., using a proper queue or a more sophisticated rate-limiting strategy)
    // should be implemented if this becomes a production system.
    await new Promise(r => setTimeout(r, 1000));
    return response.json();
}

export function transformWeatherData(rawData: any): WeatherDataPoint[] {
    const validatedData = openMeteoResponseSchema.parse(rawData);
    const hourlyData = validatedData.hourly;
    const timePoints = hourlyData.time.length;
    const transformedData: WeatherDataPoint[] = [];

    for (let i = 0; i < timePoints; i++) {
        const dataPoint: any = { time: hourlyData.time[i] };
        for (const key in hourlyData) {
            if (key !== 'time') {
                const camelCaseKey = KEY_MAP[key];
                if (camelCaseKey) {
                    dataPoint[camelCaseKey] = (hourlyData as any)[key][i];
                }
            }
        }
        transformedData.push(dataPoint as WeatherDataPoint);
    }
    return transformedData;
}
