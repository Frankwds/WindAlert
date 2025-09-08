import { NextRequest, NextResponse } from 'next/server';
import { after } from 'next/server';
import { openMeteoResponseSchema } from '../../../lib/openMeteo/zod';
import { mapOpenMeteoData } from '../../../lib/openMeteo/mapping';
import { mapYrData } from '../../../lib/yr/mapping';
import { combineDataSources } from './_lib/utils/combineData';
import { fetchMeteoData } from '@/lib/openMeteo/apiClient';
import { fetchYrData } from '@/lib/yr/apiClient';
import { ForecastCacheService } from '@/lib/supabase/forecastCache';
import { isGoodParaglidingCondition } from './_lib/validate/validateDataPoint';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { ForecastCache1hr, ParaglidingLocationForCache } from '@/lib/supabase/types';
import { DEFAULT_ALERT_RULE } from './mockdata/alert-rules';
import { locationToWindDirectionSymbols } from '@/lib/utils/getWindDirection';

const BATCH_SIZE = 50;

async function processBatch(locations: ParaglidingLocationForCache[]) {

  // Fetch OpenMeteo data for all locations in bulk
  const latitudes = locations.map((location) => location.latitude);
  const longitudes = locations.map((location) => location.longitude);
  const rawMeteoDataArray = await fetchMeteoData(latitudes, longitudes);

  // Process each location individually
  for (const [index, location] of locations.entries()) {
    try {
      const rawMeteoData = rawMeteoDataArray[index];
      const validatedData = openMeteoResponseSchema.parse(rawMeteoData);
      const meteoData = mapOpenMeteoData(validatedData);

      // Fetch YR data for takeoff location
      const yrTakeoffData = await fetchYrData(
        location.latitude,
        location.longitude
      );
      const mappedYrTakeoffData = mapYrData(yrTakeoffData);


      // Combine data sources
      let combinedData = combineDataSources(
        meteoData,
        mappedYrTakeoffData.weatherDataYrHourly
      );

      // Fetch YR data for landing location if it exists
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

      // Validate forecast data
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

      // Upsert forecast data
      await ForecastCacheService.upsert(validatedForecastData);
    } catch (error) {
      console.error(`Failed to process location ${location.id}:`, error);
    }
  }
}



async function processOldestLocations() {
  try {
    const locationIds = await ForecastCacheService.getLocationsWithOldestForecastData(BATCH_SIZE);
    const locations = await ParaglidingLocationService.getByIds(locationIds);

    console.log(`Processing ${locations.length} locations total`);

    try {
      await processBatch(locations);
    } catch (error) {
      console.error(`Batch processing failed, retrying... Error: ${error}`);
      try {
        await processBatch(locations);
      } catch (retryError) {
        console.error(`Batch processing retry failed, not retrying. Error: ${retryError}`);
        throw retryError;
      }
    }
  } catch (error) {
    console.error('Failed to process oldest locations:', error);
  }

  console.log('Forecast update completed successfully');
}

async function cleanupOldForecastData() {
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const twoHoursAgoISO = twoHoursAgo.toISOString();

  console.log(`Deleting forecast data older than: ${twoHoursAgoISO}`);

  await ForecastCacheService.deleteOldData(twoHoursAgoISO);

  console.log('Forecast data cleanup completed successfully');
}

export async function GET(request: NextRequest) {
  console.log('Cron job called');

  const token = request.headers.get('token');
  const expectedToken = process.env.CRON_SECRET;
  if (!token || !expectedToken || token !== expectedToken) {
    console.log('Unauthorized cron job attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  after(async () => {
    try {
      console.log('Starting forecast update in background');
      await cleanupOldForecastData();
      await processOldestLocations();
    } catch (error) {
      console.error('Background forecast update failed:', error);
    }
  });

  return NextResponse.json({ message: 'Forecast updates in background' });
}

