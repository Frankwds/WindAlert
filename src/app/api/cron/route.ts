import { NextResponse } from 'next/server';
import { ALERT_RULES } from './config/alert-rules';
import { openMeteoResponseSchema } from './lib/validation/openmeteo-validation';
import { fetchWeatherData, mapOpenMeteoData } from './services/open-meteo.service';
import { combineDataSources, groupByDay, validateWeather } from './services/weather.service';
import { fetchWeatherDataYr, mapYrData } from './services/yr.service';

export async function GET() {
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
                    const yrData = mapYrData(rawYrData);

                    const rawData = await fetchWeatherData(alertRule.lat, alertRule.long);
                    const validatedData = openMeteoResponseSchema.parse(rawData);
                    const meteoData = mapOpenMeteoData(validatedData);

                    const combinedData = combineDataSources(meteoData, yrData.weatherDataYr1h);
                    const groupedData = groupByDay(combinedData);
                    const { overallResult, dailyData } = validateWeather(groupedData, alertRule);
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
