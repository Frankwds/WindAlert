import { NextRequest, NextResponse } from 'next/server';
import { openMeteoResponseSchema } from '../../../lib/openMeteo/zod';
import { mapOpenMeteoData } from '../../../lib/openMeteo/mapping';
import { mapYrData } from '../../../lib/yr/mapping';
import { combineDataSources } from './_lib/utils/combineData';
import { fetchMeteoData } from '@/lib/openMeteo/apiClient';
import { fetchYrData } from '@/lib/yr/apiClient';
import { ForecastCacheService } from '@/lib/supabase/forecastCache';
import { isGoodParaglidingCondition } from './_lib/validate/validateDataPoint';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { ForecastCache1hr } from '@/lib/supabase/types';
import { DEFAULT_ALERT_RULE } from './mockdata/alert-rules';
import { locationToWindDirectionSymbols } from '@/lib/utils/getWindDirection';

async function processBatch(batch: any[], batchNumber: number, totalBatches: number) {
  console.log(`Processing batch ${batchNumber}/${totalBatches}: ${batch.length} locations`);

  const latitudes = batch.map((location) => location.latitude);
  const longitudes = batch.map((location) => location.longitude);
  const rawMeteoDataArray = await fetchMeteoData(latitudes, longitudes);

  for (const [index, location] of batch.entries()) {
    try {
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
        mappedYrTakeoffData.weatherDataYrHourly
      );

      if (location.landing_latitude && location.landing_longitude) {
        const yrLandingData = await fetchYrData(
          location.landing_latitude,
          location.landing_longitude
        );
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

  console.log(`Batch ${batchNumber} completed successfully`);
}

async function processForecastData() {
  console.log('Starting forecast data update...');

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const twoHoursAgoISO = twoHoursAgo.toISOString();

  await ForecastCacheService.deleteOldData(twoHoursAgoISO);

  const paraglidingLocations = await ParaglidingLocationService.getAllActiveForCache();
  const BATCH_SIZE = 50;

  for (let i = 0; i < paraglidingLocations.length; i += BATCH_SIZE) {
    const batch = paraglidingLocations.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(paraglidingLocations.length / BATCH_SIZE);

    try {
      await processBatch(batch, batchNumber, totalBatches);
    } catch (error) {
      console.error(`Batch ${batchNumber} failed:`, error);
      console.log(`Waiting 20 seconds before retrying batch ${batchNumber}...`);
      await new Promise(resolve => setTimeout(resolve, 20000));

      try {
        await processBatch(batch, batchNumber, totalBatches);
      } catch (retryError) {
        console.error(`Batch ${batchNumber} failed after retry, continuing to next batch:`, retryError);
      }
    }

    if (i + BATCH_SIZE < paraglidingLocations.length) {
      console.log(`Waiting 15 seconds before next batch`);
      await new Promise(resolve => setTimeout(resolve, 15000));
      console.log(`Done waiting`);
    }
  }

  console.log('Cron job completed successfully');
}

export async function GET(request: NextRequest) {
  console.log('Cron job called');

  // Check for authorization token
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');
  const expectedToken = process.env.CRON_SECRET;

  if (!token || !expectedToken || token !== expectedToken) {
    console.log('Unauthorized cron job attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const lastUpdatedData = await ForecastCacheService.getLastUpdated();
  let message = '';
  const lastUpdated = new Date(lastUpdatedData?.updated_at || '1970-01-01T00:00:00Z');
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  console.log(lastUpdated, oneHourAgo);
  if (lastUpdated > oneHourAgo) {
    console.log('Data was updated less than 1 hour ago, skipping update');
    message = 'Data update skipped - last update was less than 1 hour ago: ' + lastUpdated.toISOString();

  } else {
    console.log('Starting cron job in background');
    message = 'Starting cron job in background';
    // Start background processing(don't await)
    processForecastData().catch(error => {
      console.error('Background cron job failed:', error);
    });

  }
  return NextResponse.json({ message });
}

