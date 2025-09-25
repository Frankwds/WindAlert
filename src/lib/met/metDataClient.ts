import axios from 'axios';
import { metObservationsResponseSchema, MetObservationsResponse } from './zod';
import { mapMetObservationsToStationData } from './mapping';
import { StationData } from '../supabase/types';
import { Server } from '../supabase/server';

// Station IDs for testing
const STATION_IDS = ['SN61820', 'SN310000', 'SN88200', 'SN51460', 'SN73466'];

// Query parameters constants
const QUERY_PARAMS = {
  // Base URL for MET Frost observations API
  BASE_URL: 'https://frost.met.no/observations/v0.jsonld',

  // Elements to fetch
  ELEMENTS: [
    'wind_speed',
    'wind_from_direction',
    'max(wind_speed_of_gust PT10M)',
    'air_temperature'
  ],

  // Time resolution (10 minutes)
  TIME_RESOLUTION: 'PT10M',

  // Batch size for database inserts
  BATCH_SIZE: 100,
} as const;

/**
 * Gets the last 10 minutes of station data from MET Frost API
 * @returns Promise<StationData[]> Array of station data records
 */
export async function fetchMetStationData(): Promise<Omit<StationData, 'id'>[]> {
  try {
    console.log('Fetching MET station data for last 10 minutes...');

    const clientId = process.env.MET_CLIENT_ID;
    if (!clientId) {
      throw new Error('MET_CLIENT_ID environment variable is not set');
    }

    // Calculate time range (last 10 minutes)
    const now = new Date();
    const tenMinutesAgo = new Date(now.getTime() - 10 * 60 * 1000);

    const timeRange = `${tenMinutesAgo.toISOString()}/${now.toISOString()}`;

    // Create Basic auth header
    const authHeader = Buffer.from(`${clientId}:`).toString('base64');

    // Build query parameters
    const params = {
      sources: STATION_IDS.join(','),
      referencetime: timeRange,
      elements: QUERY_PARAMS.ELEMENTS.join(','),
    };

    console.log(`Querying MET API for stations: ${STATION_IDS.join(', ')}`);
    console.log(`Time range: ${timeRange}`);
    console.log(`Elements: ${QUERY_PARAMS.ELEMENTS.join(', ')}`);

    const response = await axios.get(QUERY_PARAMS.BASE_URL, {
      params,
      timeout: 30000, // 30 second timeout
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'WindAlert/1.0',
        'Authorization': `Basic ${authHeader}`,
      },
    });

    console.log(`MET API response received: ${response.data?.data?.length || 0} data points`);

    // Validate and parse the response data
    const validatedData = metObservationsResponseSchema.parse(response.data);
    console.log(`Validated ${validatedData.data.length} data points from MET API`);

    // Map to StationData format
    const stationData = mapMetObservationsToStationData(validatedData.data);
    console.log(`Mapped ${stationData.length} station data records`);

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

/**
 * Fetches MET station data and inserts it into the database with pagination
 * @returns Promise<{ insertedCount: number; errors: string[] }>
 */
export async function fetchAndInsertMetStationData(): Promise<{
  insertedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    console.log('🚀 Starting MET station data fetch and insert...\n');

    // Step 1: Fetch station data from MET API
    console.log('📡 Fetching station data from MET API...');
    const stationData = await fetchMetStationData();
    console.log(`✅ Fetched ${stationData.length} station data records\n`);

    if (stationData.length === 0) {
      console.log('⚠️  No station data fetched from MET API');
      return {
        insertedCount: 0,
        errors: ['No station data fetched from MET API'],
      };
    }

    // Step 2: Insert data with pagination
    console.log(`🔄 Inserting ${stationData.length} station data records with pagination...`);

    const batchSize = QUERY_PARAMS.BATCH_SIZE;
    let totalInserted = 0;

    for (let i = 0; i < stationData.length; i += batchSize) {
      const batch = stationData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(stationData.length / batchSize);

      try {
        console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

        const insertedRecords = await Server.insertManyStationData(batch);
        totalInserted += insertedRecords.length;

        console.log(`✅ Batch ${batchNumber} completed: ${insertedRecords.length} records inserted`);
      } catch (error) {
        const errorMsg = `Error inserting batch ${batchNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);

        // Fail completely as requested
        throw new Error(errorMsg);
      }
    }

    console.log(`\n📊 Insert Results:`);
    console.log(`==================`);
    console.log(`Total records fetched: ${stationData.length}`);
    console.log(`Successfully inserted: ${totalInserted}`);
    console.log(`Errors: ${errors.length}`);

    if (totalInserted > 0) {
      console.log(`\n✅ Successfully inserted ${totalInserted} MET station data records!`);
    }

    return {
      insertedCount: totalInserted,
      errors,
    };

  } catch (error) {
    const errorMsg = `Failed to fetch and insert MET station data: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`\n💥 ${errorMsg}`);
    errors.push(errorMsg);

    return {
      insertedCount: 0,
      errors,
    };
  }
}
