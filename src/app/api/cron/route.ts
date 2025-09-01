import { NextResponse } from 'next/server';
import { openMeteoResponseSchema } from '../../../lib/openMeteo/zod';
import { mapOpenMeteoData } from '../../../lib/openMeteo/mapping';
import { mapYrData } from '../../../lib/yr/mapping';
import { combineDataSources } from './_lib/utils/combineData';
import { fetchMeteoData } from '@/lib/openMeteo/apiClient';
import { fetchYrData } from '@/lib/yr/apiClient';
import { ForecastCacheService } from '@/lib/supabase/forecastCache';
import { isGoodParaglidingCondition } from './_lib/validate/validateDataPoint';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { ForecastCache1hr, YrCache } from '@/lib/supabase/types';
import { DEFAULT_ALERT_RULE } from './mockdata/alert-rules';
import { locationToWindDirectionSymbols } from '@/lib/utils/getWindDirection';
import { YrCacheService } from '@/lib/supabase/yrCache';

async function getYrDataWithCache(
  locationId: string,
  latitude: number,
  longitude: number
): Promise<any> {
  const cache = await YrCacheService.get(locationId);

  if (cache && new Date(cache.expires) > new Date()) {
    console.log(`Cache valid for location ${locationId}`);
    return cache.data;
  }

  const ifModifiedSince = cache?.last_modified;
  const response = await fetchYrData(latitude, longitude, ifModifiedSince);

  if (response.status === 304) {
    console.log(`Data not modified for location ${locationId}`);
    const newExpires = response.headers.get('Expires');
    if (newExpires && cache) {
      await YrCacheService.upsert({
        ...cache,
        expires: newExpires,
      });
    }
    return cache?.data;
  }

  if (response.status !== 200) {
    console.error(`Failed to fetch YR data for ${locationId}, status: ${response.status}`);
    return null;
  }

  const newExpires = response.headers.get('Expires');
  const newLastModified = response.headers.get('Last-Modified');

  if (newExpires && newLastModified) {
    await YrCacheService.upsert({
      location_id: locationId,
      expires: newExpires,
      last_modified: newLastModified,
      data: response.data,
    });
  }

  return response.data;
}

export async function GET() {
  const paraglidingLocations = await ParaglidingLocationService.getAllActiveForCache();
  const BATCH_SIZE = 50;

  for (let i = 0; i < paraglidingLocations.length; i += BATCH_SIZE) {
    const batch = paraglidingLocations.slice(i, i + BATCH_SIZE);
    console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(paraglidingLocations.length / BATCH_SIZE)}: ${batch.length} locations`);

    const latitudes = batch.map((location) => location.latitude);
    const longitudes = batch.map((location) => location.longitude);
    const rawMeteoDataArray = await fetchMeteoData(latitudes, longitudes);

    for (const [index, location] of batch.entries()) {
      try {
        const rawMeteoData = rawMeteoDataArray[index];
        const validatedData = openMeteoResponseSchema.parse(rawMeteoData);
        const meteoData = mapOpenMeteoData(validatedData);

        const yrTakeoffData = await getYrDataWithCache(
          location.id,
          location.latitude,
          location.longitude
        );

        if (!yrTakeoffData) {
          console.error(`Skipping location ${location.id} due to missing YR takeoff data.`);
          continue;
        }

        const mappedYrTakeoffData = mapYrData(yrTakeoffData);

        let combinedData = combineDataSources(
          meteoData,
          mappedYrTakeoffData.weatherDataYrHourly
        );

        if (location.landing_latitude && location.landing_longitude) {
          const yrLandingData = await getYrDataWithCache(
            `${location.id}-landing`,
            location.landing_latitude,
            location.landing_longitude
          );

          if (yrLandingData) {
            const mappedYrLandingData = mapYrData(yrLandingData);

            combinedData = combinedData.map((dataPoint) => {
              const landingDataPoint =
                mappedYrLandingData.weatherDataYrHourly.find(
                  (landingPoint) => landingPoint.time === dataPoint.time
                );

              return {
                ...dataPoint,
                landing_wind: landingDataPoint?.wind_speed,
                landing_gust: landingDataPoint?.wind_speed_of_gust,
                landing_wind_direction: landingDataPoint?.wind_from_direction,
              };
            });
          }
        }

        const validatedForecastData: ForecastCache1hr[] = combinedData.map((dataPoint) => {
          const { isGood } = isGoodParaglidingCondition(
            dataPoint,
            DEFAULT_ALERT_RULE,
            locationToWindDirectionSymbols(location)
          );
          return {
            ...dataPoint,
            location_id: location.id,
            is_promising: isGood,
          };
        });

        await ForecastCacheService.upsert(validatedForecastData);
      } catch (error) {
        console.error(
          `Failed to process location ${location.id}:`,
          error
        );
      }
    }

    if (i + BATCH_SIZE < paraglidingLocations.length) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
  }

  return NextResponse.json({ message: 'Cron job completed successfully' });
}

