import { NextRequest, NextResponse } from 'next/server';
import { WeatherDataPoint } from './types';
import { envSchema, openMeteoResponseSchema } from './validation';
import { validateWeather } from './validateWeather';

const keyMap: { [key: string]: string } = {
    "wind_speed_1000hPa": "windSpeed1000hPa",
    "wind_direction_1000hPa": "windDirection1000hPa",
    "wind_direction_925hPa": "windDirection925hPa",
    "wind_speed_925hPa": "windSpeed925hPa",
    "wind_speed_850hPa": "windSpeed850hPa",
    "wind_direction_850hPa": "windDirection850hPa",
    "wind_direction_700hPa": "windDirection700hPa",
    "wind_speed_700hPa": "windSpeed700hPa",
    "temperature_1000hPa": "temperature1000hPa",
    "temperature_925hPa": "temperature925hPa",
    "temperature_850hPa": "temperature850hPa",
    "temperature_700hPa": "temperature700hPa",
    "temperature_2m": "temperature2m",
    "precipitation": "precipitation",
    "precipitation_probability": "precipitationProbability",
    "cloud_cover": "cloudCover",
    "wind_speed_10m": "windSpeed10m",
    "wind_direction_10m": "windDirection10m",
    "wind_gusts_10m": "windGusts10m",
    "weather_code": "weatherCode",
    "pressure_msl": "pressureMsl",
    "convective_inhibition": "convectiveInhibition",
    "cloud_cover_low": "cloudCoverLow",
    "cloud_cover_mid": "cloudCoverMid",
    "cloud_cover_high": "cloudCoverHigh",
    "is_day": "isDay",
    "freezing_level_height": "freezingLevelHeight",
    "cape": "cape",
    "lifted_index": "liftedIndex",
    "boundary_layer_height": "boundaryLayerHeight"
};

export async function GET(request: NextRequest) {
    try {
        const env = envSchema.parse(process.env);

        const authHeader = request.headers.get('authorization');
        if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
            return new Response('Unauthorized', { status: 401 });
        }

        const API_URL = "https://api.open-meteo.com/v1/forecast?latitude=67.31493&longitude=14.47845&wind_speed_unit=ms&hourly=wind_speed_1000hPa,wind_direction_1000hPa,wind_direction_925hPa,wind_speed_925hPa,wind_speed_850hPa,wind_direction_850hPa,wind_direction_700hPa,wind_speed_700hPa,temperature_1000hPa,temperature_925hPa,temperature_850hPa,temperature_700hPa,temperature_2m,precipitation,precipitation_probability,cloud_cover,wind_speed_10m,wind_direction_10m,wind_gusts_10m,weather_code,pressure_msl,convective_inhibition,cloud_cover_low,cloud_cover_mid,cloud_cover_high,is_day,freezing_level_height,cape,lifted_index,boundary_layer_height&forecast_days=1&models=best_match";

        const response = await fetch(API_URL);
        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Failed to fetch weather data: ${response.statusText}`, errorText);
            return new Response(`Failed to fetch weather data: ${response.statusText}`, { status: response.status });
        }

        const rawData = await response.json();
        const validatedData = openMeteoResponseSchema.parse(rawData);

        const hourlyData = validatedData.hourly;
        const timePoints = hourlyData.time.length;
        const transformedData: WeatherDataPoint[] = [];

        for (let i = 0; i < timePoints; i++) {
            const dataPoint: any = { time: hourlyData.time[i] };
            for (const key in hourlyData) {
                if (key !== 'time') {
                    const camelCaseKey = keyMap[key];
                    if(camelCaseKey) {
                        dataPoint[camelCaseKey] = (hourlyData as any)[key][i];
                    }
                }
            }
            transformedData.push(dataPoint as WeatherDataPoint);
        }

        const isGood = validateWeather(transformedData);

        return NextResponse.json(isGood ? "positive" : "negative");

    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === 'ZodError') {
            return new Response(JSON.stringify(error), { status: 400 });
        }
        return new Response('Error processing request', { status: 500 });
    }
}
