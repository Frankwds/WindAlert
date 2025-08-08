import { NextRequest, NextResponse } from 'next/server';
import { COORDINATES } from './config/locations';
import { envSchema } from './lib/validation';
import { fetchWeatherData, transformWeatherData } from './services/open-meteo.service';
import { validateWeather } from './services/weather.service';

export async function GET(request: NextRequest) {
    try {
        // Disabled for now, uncomment later:
        // const env = envSchema.parse(process.env);
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        //     return new Response('Unauthorized', { status: 401 });
        // }

        const results = await Promise.all(
            COORDINATES.map(async (location) => {
                try {
                    const rawData = await fetchWeatherData(location.latitude, location.longitude);
                    const transformedData = transformWeatherData(rawData);
                    const { overallResult, hourlyData } = validateWeather(transformedData);
                    return {
                        name: location.name,
                        result: overallResult,
                        hourlyData: hourlyData,
                    };
                } catch (error) {
                    console.error(`Failed to process location ${location.name}:`, error);
                    return { name: location.name, result: 'error', hourlyData: [] };
                }
            })
        );

        return NextResponse.json(results);

    } catch (error) {
        console.error(error);
        if (error instanceof Error && error.name === 'ZodError') {
            return new Response(JSON.stringify(error), { status: 400 });
        }
        return new Response('Error processing request', { status: 500 });
    }
}
