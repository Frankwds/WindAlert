import { NextRequest, NextResponse } from 'next/server';
import { ALERT_RULES } from './config/locations';
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
            ALERT_RULES.map(async (location) => {
                try {
                    const rawData = await fetchWeatherData(location.lat, location.long);
                    const transformedData = transformWeatherData(rawData);
                    const { overallResult, dailyData } = validateWeather(transformedData);
                    return {
                        alert_name: location.alert_name,
                        locationName: location.locationName,
                        result: overallResult,
                        dailyData: dailyData,
                        lat: location.lat,
                        long: location.long,
                    };
                } catch (error) {
                    console.error(`Failed to process location ${location.locationName}:`, error);
                    return { alert_name: location.alert_name, locationName: location.locationName, result: 'error', dailyData: [] };
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
