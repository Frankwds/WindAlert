import { metNoResponseSchema } from '../lib/yr-validation';
import { WeatherDataPointYr } from '../types/yr';

export async function fetchWeatherData(latitude: number, longitude: number): Promise<any> {
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/complete?lat=${latitude}&lon=${longitude}`;

    const response = await fetch(url, {
        headers: {
            'User-Agent': 'paragliding-weather-app/1.0'
        }
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch weather data for ${latitude},${longitude}: ${response.statusText}`, errorText);
        throw new Error(`Failed to fetch weather data`);
    }
    return response.json();
}

export function transformWeatherData(rawData: any): WeatherDataPointYr[] {
    const validatedData = metNoResponseSchema.parse(rawData);
    const timeseries = validatedData.properties.timeseries;

    const transformedData: WeatherDataPointYr[] = timeseries.map(item => {
        const dataPoint: WeatherDataPointYr = {
            time: item.time,
            ...item.data.instant?.details,
            ...item.data.next_1_hours?.details,
            symbol_code: item.data.next_1_hours?.summary?.symbol_code,
        };
        return dataPoint;
    });

    return transformedData;
}
