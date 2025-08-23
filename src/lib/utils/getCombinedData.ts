import { fetchMeteoData } from '@/lib/openMeteo/apiClient';
import { fetchYrData } from '@/lib/yr/apiClient';
import { openMeteoResponseSchema } from '@/lib/openMeteo/zod';
import { mapOpenMeteoData } from '@/lib/openMeteo/mapping';
import { mapYrData } from '@/lib/yr/mapping';
import { combineDataSources } from '@/app/api/cron/_lib/utils/combineData';
import { groupByDay } from '@/app/api/cron/_lib/utils/groupData';
import { WeatherDataPoint } from '@/lib/openMeteo/types';

interface Coordinates {
  lat: number;
  long: number;
}

export async function getCombinedData(
  coordinates: Coordinates
): Promise<Record<string, WeatherDataPoint[]>> {
  try {
    // Fetch data from both sources
    const [rawMeteoData, rawYrData] = await Promise.all([
      fetchMeteoData([coordinates.lat], [coordinates.long]).then(data => data[0]),
      fetchYrData(coordinates.lat, coordinates.long),
    ]);

    // Process OpenMeteo data
    const validatedMeteoData = openMeteoResponseSchema.parse(rawMeteoData);
    const meteoData = mapOpenMeteoData(validatedMeteoData);

    // Process Yr data
    const yrData = mapYrData(rawYrData);

    // Combine and group the data
    const combinedData = combineDataSources(meteoData, yrData.weatherDataYr1h);
    const groupedData = groupByDay(combinedData);

    return groupedData;
  } catch (error) {
    console.error('Error fetching or processing weather data:', error);
    throw error;
  }
}
