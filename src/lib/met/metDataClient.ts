import axios from 'axios';
import { metObservationsResponseSchema, MetObservationsResponse } from './zod';
import { mapMetObservationsToStationData } from './mapping';
import { StationData } from '../supabase/types';
import { Server } from '../supabase/server';

// Batch size for API requests
const API_BATCH_SIZE = 100;

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
 * @param stationIds Array of station IDs to fetch data for
 * @returns Promise<StationData[]> Array of station data records
 */
export async function fetchMetStationData(stationIds: string[]): Promise<Omit<StationData, 'id'>[]> {
  try {
    console.log(`Fetching MET station data for last 10 minutes from ${stationIds.length} stations...`);

    if (stationIds.length === 0) {
      console.log('No station IDs provided');
      return [];
    }

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

    console.log(`Time range: ${timeRange}`);
    console.log(`Elements: ${QUERY_PARAMS.ELEMENTS.join(', ')}`);

    // Process stations in batches
    const allStationData: Omit<StationData, 'id'>[] = [];
    const errors: string[] = [];

    for (let i = 0; i < stationIds.length; i += API_BATCH_SIZE) {
      const batch = stationIds.slice(i, i + API_BATCH_SIZE);
      const batchNumber = Math.floor(i / API_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(stationIds.length / API_BATCH_SIZE);

      try {
        console.log(`Processing API batch ${batchNumber}/${totalBatches} (${batch.length} stations)...`);

        // Build query parameters for this batch
        const params = {
          sources: batch.join(','),
          referencetime: timeRange,
          elements: QUERY_PARAMS.ELEMENTS.join(','),
        };
        // console.log(QUERY_PARAMS.BASE_URL, +'?' + Object.entries(params).map(([key, value]) => `${key}=${value}`).join('&'));

        const response = await axios.get(QUERY_PARAMS.BASE_URL, {
          params,
          timeout: 30000, // 30 second timeout
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'WindAlert/1.0',
            'Authorization': `Basic ${authHeader}`,
          },
        });
        // console.log('Response:', response.data);

        console.log(`API batch ${batchNumber} response: ${response.data?.data?.length || 0} data points`);

        // Validate and parse the response data
        const validatedData = metObservationsResponseSchema.parse(response.data);
        console.log(`Validated ${validatedData.data.length} data points from API batch ${batchNumber}`);

        // Map to StationData format
        const batchStationData = mapMetObservationsToStationData(validatedData.data);
        allStationData.push(...batchStationData);

        console.log(`API batch ${batchNumber} completed: ${batchStationData.length} records mapped`);
      } catch (error) {
        const errorMsg = `Error processing API batch ${batchNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
        // Continue with remaining batches as requested
      }
    }

    console.log(`\n📊 API Fetch Results:`);
    console.log(`=====================`);
    console.log(`Total stations requested: ${stationIds.length}`);
    console.log(`Total records fetched: ${allStationData.length}`);
    console.log(`API batch errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ API batch errors encountered:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    return allStationData;

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
 * @param stationIds Array of station IDs to fetch data for
 * @returns Promise<{ insertedCount: number; errors: string[] }>
 */
export async function fetchAndInsertMetStationData(stationIds: string[]): Promise<{
  insertedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    console.log('🚀 Starting MET station data fetch and insert...\n');

    // Step 1: Fetch station data from MET API
    console.log('📡 Fetching station data from MET API...');
    const stationData = await fetchMetStationData(stationIds);
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
