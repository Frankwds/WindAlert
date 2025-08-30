import { NextResponse } from 'next/server';
import { openMeteoResponseSchema } from '../../../lib/openMeteo/zod';
import { mapOpenMeteoData } from '../../../lib/openMeteo/mapping';
import { mapYrData } from '../../../lib/yr/mapping';
import { combineDataSources } from './_lib/utils/combineData';
import { fetchMeteoData } from '@/lib/openMeteo/apiClient';
import { fetchYrData } from '@/lib/yr/apiClient';
import { createClient } from '@supabase/supabase-js';
import { ParaglidingLocation } from '@/lib/supabase/types';
import { WEATHER_FORECAST_72h } from '@/lib/supabase/forecast';
import { isGoodParaglidingCondition } from './_lib/validate/validateDataPoint';
import { AlertRule } from '@/lib/common/types/alertRule';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data: locations, error: locationsError } = await supabase
      .from('paragliding_locations')
      .select('*');

    if (locationsError) {
      throw locationsError;
    }

    const { data: alertRules, error: alertRulesError } = await supabase
      .from('alert_rules')
      .select('*');

    if (alertRulesError) {
      throw alertRulesError;
    }

    const paraglidingLocations: ParaglidingLocation[] = locations;
    const alertRulesTyped: AlertRule[] = alertRules;

    const latitudes = paraglidingLocations.map((location) => location.latitude);
    const longitudes = paraglidingLocations.map(
      (location) => location.longitude
    );
    const rawMeteoDataArray = await fetchMeteoData(latitudes, longitudes);

    for (const [index, location] of paraglidingLocations.entries()) {
      try {
        const alertRule = alertRulesTyped.find(
          (rule) => rule.locationId === location.id
        );

        if (!alertRule) {
          console.error(`No alert rule found for location ${location.name}`);
          continue;
        }

        const rawMeteoData = rawMeteoDataArray[index];
        const validatedData = openMeteoResponseSchema.parse(rawMeteoData);
        const meteoData = mapOpenMeteoData(validatedData);

        const yrTakeoffData = await fetchYrData(
          location.latitude,
          location.longitude
        );
        const mappedYrTakeoffData = mapYrData(yrTakeoffData);

        let combinedData = combineDataSources(
          meteoData,
          mappedYrTakeoffData.weatherDataYr1h
        );

        if (location.landing_latitude && location.landing_longitude) {
          const yrLandingData = await fetchYrData(
            location.landing_latitude,
            location.landing_longitude
          );
          const mappedYrLandingData = mapYrData(yrLandingData);

          combinedData = combinedData.map((dataPoint) => {
            const landingDataPoint =
              mappedYrLandingData.weatherDataYr1h.find(
                (landingPoint) => landingPoint.time === dataPoint.time
              );

            return {
              ...dataPoint,
              landing_wind: landingDataPoint?.windSpeed10m ?? 0,
              landing_gust: landingDataPoint?.windGusts10m ?? 0,
              landing_wind_direction: landingDataPoint?.windDirection10m ?? 0,
            };
          });
        } else {
          combinedData = combinedData.map((dataPoint) => ({
            ...dataPoint,
            landing_wind: 0,
            landing_gust: 0,
            landing_wind_direction: 0,
          }));
        }

        const forecastData: Omit<WEATHER_FORECAST_72h, 'isPromising'>[] =
          combinedData;

        const validatedForecastData = await Promise.all(
          forecastData.map(async (dataPoint) => {
            const { isGood } = isGoodParaglidingCondition(
              dataPoint,
              alertRule,
              location
            );
            return {
              ...dataPoint,
              isPromising: isGood,
              location_id: location.id,
            };
          })
        );

        await supabase
          .from('WEATHER_FORECAST_72h')
          .upsert(validatedForecastData, { onConflict: 'time,location_id' });
      } catch (error) {
        console.error(
          `Failed to process location ${location.name}:`,
          error
        );
      }
    }

    return NextResponse.json({ message: 'Cron job completed successfully' });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.name === 'ZodError') {
      return new Response(JSON.stringify(error), { status: 400 });
    }
    return new Response('Error processing request', { status: 500 });
  }
}
