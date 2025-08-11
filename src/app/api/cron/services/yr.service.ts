import { metNoResponseSchema, hourlySchema, sixHourlySchema } from '../lib/yr-validation';
import { WeatherDataPointYr1h } from '../types/yr';

export async function fetchWeatherDataYr(latitude: number, longitude: number): Promise<any> {
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

function findFirstMissingNext1HoursIndex(timeseries: any[]): number {
    const index = timeseries.findIndex(item => !item.data.next_1_hours);
    return index === -1 ? timeseries.length : index;
}

export function transformWeatherDataYr(rawData: any): WeatherDataPointYr1h[] {
    const firstMissingIndex = findFirstMissingNext1HoursIndex(rawData.properties.timeseries);
    const slicedHourlyData = rawData.properties.timeseries.slice(0, firstMissingIndex);
    const slicedSixHourData = rawData.properties.timeseries.slice(firstMissingIndex, 80);

    const validatedMetaData = metNoResponseSchema.parse(rawData);
    const validatedHourlyData = hourlySchema.parse(slicedHourlyData);
    const validatedSixHourData = sixHourlySchema.parse(slicedSixHourData);
    const updated_at = validatedMetaData.properties.meta.updated_at


    const transformedData: WeatherDataPointYr1h[] = validatedHourlyData.map(item => {
        const dataPoint: WeatherDataPointYr1h = {
            time: item.time,
            ...item.data.instant.details,
            ...item.data.next_1_hours.details,
            symbol_code: item.data.next_1_hours.summary.symbol_code,
        };
        return dataPoint;
    });

    return transformedData;
}