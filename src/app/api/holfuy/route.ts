import { NextRequest, NextResponse } from 'next/server';
import { fetchHolfuyData } from '@/lib/holfuy/apiClient';
import { Server } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('token');
  const expectedToken = process.env.CRON_SECRET;
  if (!token || !expectedToken || token !== expectedToken) {
    console.log('Unauthorized Holfuy API attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Fetching and mapping Holfuy data...');

    // Fetch data from Holfuy API and map to StationData format
    const { stationData, holfuyStation } = await fetchHolfuyData();
    console.log(`Successfully fetched ${stationData.length} records from Holfuy API`);

    // Step 1: Upsert stations in batches
    const STATION_BATCH_SIZE = 200;
    let totalNewStations = 0;
    const stationErrors: string[] = [];

    for (let i = 0; i < holfuyStation.length; i += STATION_BATCH_SIZE) {
      const stationBatch = holfuyStation.slice(i, i + STATION_BATCH_SIZE);
      const batchNumber = Math.floor(i / STATION_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(holfuyStation.length / STATION_BATCH_SIZE);

      try {
        const missingStationIds = await Server.upsertManyWeatherStation(stationBatch);
        totalNewStations += missingStationIds.length;
        console.log(`Station batch ${batchNumber}/${totalBatches}: ${missingStationIds.length} new stations upserted`);
      } catch (error) {
        const errorMsg = `Error processing station batch ${batchNumber}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        console.error(errorMsg);
        stationErrors.push(errorMsg);
      }
    }

    // Step 2: Store station data in batches
    const DATA_BATCH_SIZE = 200;
    let totalStored = 0;
    const dataErrors: string[] = [];

    for (let i = 0; i < stationData.length; i += DATA_BATCH_SIZE) {
      const dataBatch = stationData.slice(i, i + DATA_BATCH_SIZE);
      const batchNumber = Math.floor(i / DATA_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(stationData.length / DATA_BATCH_SIZE);

      try {
        const storedBatch = await Server.upsertManyStationData(dataBatch);
        totalStored += storedBatch.length;
        await Server.refreshLatestStationData(dataBatch);
        console.log(`Data batch ${batchNumber}/${totalBatches}: ${storedBatch.length} records stored`);
      } catch (error) {
        const errorMsg = `Error processing data batch ${batchNumber}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        console.error(errorMsg);
        dataErrors.push(errorMsg);
      }
    }

    console.log(`\n📊 Holfuy Data Processing Complete:`);
    console.log(
      `Fetched: ${stationData.length} | Stored: ${totalStored} | New stations: ${totalNewStations} | Errors: ${
        stationErrors.length + dataErrors.length
      }`
    );

    return NextResponse.json({
      success: true,
      data: {
        fetched: stationData.length,
        stored: totalStored,
        newStations: totalNewStations,
        errors: stationErrors.length + dataErrors.length,
      },
      message: `Successfully stored ${totalStored} out of ${stationData.length} records and upserted ${totalNewStations} new stations`,
      ...((stationErrors.length > 0 || dataErrors.length > 0) && {
        errorDetails: [...stationErrors, ...dataErrors],
      }),
    });
  } catch (error) {
    console.error('Error processing Holfuy data:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to process Holfuy data',
      },
      { status: 500 }
    );
  }
}
