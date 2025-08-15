import { NextResponse } from 'next/server';
import { ALERT_RULES } from './mockdata/alert-rules';
import { LOCATIONS } from './mockdata/locations';
import { openMeteoResponseSchema } from '../../../lib/openMeteo/zod';
import { mapOpenMeteoData } from '../../../lib/openMeteo/mapping';
import { validateWeather } from './_lib/validate/validateRule';
import { mapYrData } from '../../../lib/yr/mapping';
import { combineDataSources } from './_lib/utils/combineData';
import { groupByDay } from './_lib/utils/groupData';
import { fetchMeteoData } from '@/lib/openMeteo/apiClient';
import { fetchYrData } from '@/lib/yr/apiClient';

export async function GET() {
    try {
        // Disabled for now, uncomment later:
        // const env = envSchema.parse(process.env);
        // const authHeader = request.headers.get('authorization');
        // if (authHeader !== `Bearer ${env.CRON_SECRET}`) {
        //     return new Response('Unauthorized', { status: 401 });
        // }

        const latitudes = LOCATIONS.map(location => location.lat);
        const longitudes = LOCATIONS.map(location => location.long);
        const rawMeteoDataArray = await fetchMeteoData(latitudes, longitudes);

        const results = await Promise.all(
            LOCATIONS.map(async (location, index) => {
                const alertRule = ALERT_RULES.find(rule => rule.locationId === location.id);
                if (!alertRule) {
                    console.error(`No alert rule found for location ${location.name}`);
                    return {
                        alert_name: 'N/A',
                        locationName: location.name,
                        result: 'error',
                        dailyData: [],
                        lat: location.lat,
                        long: location.long,
                        elevation: location.elevation,
                    };
                }

                try {
                    const rawYrData = await fetchYrData(location.lat, location.long);
                    const yrData = mapYrData(rawYrData);

                    const rawMeteoData = rawMeteoDataArray[index];
                    const validatedData = openMeteoResponseSchema.parse(rawMeteoData);
                    const meteoData = mapOpenMeteoData(validatedData);

                    const combinedData = combineDataSources(meteoData, yrData.weatherDataYr1h);
                    const groupedData = groupByDay(combinedData);
                    const { overallResult, dailyData } = validateWeather(groupedData, alertRule, location);
                    return {
                        alert_name: alertRule.alert_name,
                        locationName: location.name,
                        result: overallResult,
                        dailyData: dailyData,
                        lat: location.lat,
                        long: location.long,
                        elevation: rawMeteoData.elevation,
                    };
                } catch (error) {
                    console.error(`Failed to process location ${location.name}:`, error);
                    return {
                        alert_name: alertRule.alert_name,
                        locationName: location.name,
                        result: 'error',
                        dailyData: [],
                        lat: location.lat,
                        long: location.long,
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
