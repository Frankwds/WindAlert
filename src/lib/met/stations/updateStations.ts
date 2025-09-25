import { fetchMetFrostStations } from './apiClient';
import { WeatherStationService } from '../../supabase/weatherStations';
import { Server } from '../../supabase/server';

/**
 * Updates weather stations from Met Frost API
 * Fetches all stations, finds missing ones, and upserts them to the database
 */
export async function updateMetFrostStations(): Promise<{
  totalFetched: number;
  missingCount: number;
  upsertedCount: number;
  errors: string[];
}> {
  const errors: string[] = [];

  try {
    console.log('🚀 Starting Met Frost stations update...\n');

    // Step 1: Fetch all stations from Met Frost API
    console.log('📡 Fetching stations from Met Frost API...');
    const allStations = await fetchMetFrostStations();
    console.log(`✅ Fetched ${allStations.length} stations from Met Frost API\n`);

    if (allStations.length === 0) {
      console.log('⚠️  No stations fetched from Met Frost API');
      return {
        totalFetched: 0,
        missingCount: 0,
        upsertedCount: 0,
        errors: ['No stations fetched from Met Frost API'],
      };
    }

    // Step 2: Get station IDs and find missing ones
    const stationIds = allStations.map(station => station.station_id);
    console.log(`🔍 Checking for missing stations (${stationIds.length} total)...`);

    const missingStationIds = await WeatherStationService.getAllMissingStationIds(stationIds);
    console.log(`📊 Found ${missingStationIds.length} missing stations out of ${stationIds.length} total\n`);

    if (missingStationIds.length === 0) {
      console.log('✅ All Met Frost stations are already in the database');
      return {
        totalFetched: allStations.length,
        missingCount: 0,
        upsertedCount: 0,
        errors: [],
      };
    }

    // Step 3: Filter stations to only include missing ones
    const stationsToUpsert = allStations.filter(station =>
      missingStationIds.includes(station.station_id)
    );

    console.log(`🔄 Upserting ${stationsToUpsert.length} missing stations...`);

    // Step 4: Upsert missing stations in batches
    const batchSize = 100;
    let totalUpserted = 0;

    for (let i = 0; i < stationsToUpsert.length; i += batchSize) {
      const batch = stationsToUpsert.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(stationsToUpsert.length / batchSize);

      try {
        console.log(`📦 Processing batch ${batchNumber}/${totalBatches} (${batch.length} stations)...`);

        const upsertedStations = await Server.upsertManyWeatherStation(batch);
        totalUpserted += upsertedStations.length;

        console.log(`✅ Batch ${batchNumber} completed: ${upsertedStations.length} stations upserted`);
      } catch (error) {
        const errorMsg = `Error upserting batch ${batchNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(`❌ ${errorMsg}`);
        errors.push(errorMsg);
      }
    }

    console.log(`\n📊 Update Results:`);
    console.log(`==================`);
    console.log(`Total stations fetched: ${allStations.length}`);
    console.log(`Missing stations found: ${missingStationIds.length}`);
    console.log(`Successfully upserted: ${totalUpserted}`);
    console.log(`Errors: ${errors.length}`);

    if (errors.length > 0) {
      console.log('\n❌ Errors encountered:');
      errors.forEach((error, index) => {
        console.log(`${index + 1}. ${error}`);
      });
    }

    if (totalUpserted > 0) {
      console.log(`\n✅ Successfully updated ${totalUpserted} Met Frost stations!`);
    }

    return {
      totalFetched: allStations.length,
      missingCount: missingStationIds.length,
      upsertedCount: totalUpserted,
      errors,
    };

  } catch (error) {
    const errorMsg = `Failed to update Met Frost stations: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(`\n💥 ${errorMsg}`);
    errors.push(errorMsg);

    return {
      totalFetched: 0,
      missingCount: 0,
      upsertedCount: 0,
      errors,
    };
  }
}
