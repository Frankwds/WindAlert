import axios from 'axios';
import { metObservationsResponseSchema } from './zod';
import { mapMetObservationsToStationData } from './mapping';
import { StationData } from '../../supabase/types';

// Query parameters constants
const QUERY_PARAMS = {
  // Base URL for MET Frost observations API
  BASE_URL: 'https://frost.met.no/observations/v0.jsonld',

  // Time range
  TIME_RANGE: 'latest',

  // Elements to fetch
  ELEMENTS: ['wind_speed', 'wind_from_direction', 'max(wind_speed_of_gust PT10M)', 'air_temperature'],
} as const;

/**
 * Gets the last 10 minutes of station data from MET Frost API
 * @param stationIds Array of station IDs to fetch data for (should be <= 100 stations)
 * @returns Promise<StationData[]> Array of station data records
 */
export async function fetchMetStationData(stationIds: string[]): Promise<Omit<StationData, 'id'>[]> {
  try {
    if (stationIds.length === 0) {
      return [];
    }

    const clientId = process.env.MET_CLIENT_ID;
    if (!clientId) {
      throw new Error('MET_CLIENT_ID environment variable is not set');
    }

    // Create Basic auth header
    const authHeader = Buffer.from(`${clientId}:`).toString('base64');

    // Build query parameters
    const params = {
      sources: stationIds.join(','),
      referencetime: QUERY_PARAMS.TIME_RANGE,
      elements: QUERY_PARAMS.ELEMENTS.join(','),
    };

    const response = await axios.get(QUERY_PARAMS.BASE_URL, {
      params,
      timeout: 30000, // 30 second timeout
      headers: {
        Accept: 'application/json',
        'User-Agent': 'WindAlert/1.0',
        Authorization: `Basic ${authHeader}`,
      },
    });

    // Validate and parse the response data
    const validatedData = metObservationsResponseSchema.parse(response.data);

    // Map to StationData format
    const stationData = mapMetObservationsToStationData(validatedData.data);

    console.log(`Fetched ${stationData.length} records from MET API`);
    return stationData;
  } catch (error) {
    console.error('Error fetching MET station data:', error);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`HTTP Error ${error.response.status}: ${error.response.statusText}`);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Network error - no response received:', error.request);
      } else {
        console.error('Request setup error:', error.message);
      }
    }

    throw new Error(`Failed to fetch MET station data: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
