import { NextRequest, NextResponse } from 'next/server';
import { ALERT_RULES } from './config/alert-rules';
import { envSchema } from './lib/validation';
import { fetchWeatherData, transformWeatherData } from './services/open-meteo.service';
import { validateWeather } from './services/weather.service';
import { fetchWeatherDataYr, transformWeatherDataYr } from './services/yr.service';

export async function GET(request: NextRequest) {
    try {
        // Disabled for now, uncomment later:
        // const env = envSchema.parse(process.env);
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        //     return new Response('Unauthorized', { status: 401 });
        // }

        const results = await Promise.all(
            ALERT_RULES.map(async (alertRule) => {
                try {

                    const rawYrData = await fetchWeatherDataYr(alertRule.lat, alertRule.long);
                    const yrData = transformWeatherDataYr(rawYrData);

                    const rawData = await fetchWeatherData(alertRule.lat, alertRule.long);
                    const meteoData = transformWeatherData(rawData);
                    const { overallResult, dailyData } = validateWeather(meteoData, yrData.weatherDataYr1h, alertRule);
                    return {
                        alert_name: alertRule.alert_name,
                        locationName: alertRule.locationName,
                        result: overallResult,
                        dailyData: dailyData,
                        lat: alertRule.lat,
                        long: alertRule.long,
                        elevation: rawData.elevation,
                    };
                } catch (error) {
                    console.error(`Failed to process location ${alertRule.locationName}:`, error);
                    return {
                        alert_name: alertRule.alert_name,
                        locationName: alertRule.locationName,
                        result: 'error',
                        dailyData: [],
                        lat: alertRule.lat,
                        long: alertRule.long,
                        elevation: 0,
                    };
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
