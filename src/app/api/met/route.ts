import { NextRequest, NextResponse } from 'next/server';
import { fetchMetStationData } from '@/lib/met/data';
import { Server } from '@/lib/supabase/server';
import { WeatherStationService } from '@/lib/supabase/weatherStations';

export async function GET(request: NextRequest) {
  const token = request.headers.get('token');
  const expectedToken = process.env.CRON_SECRET;
  if (!token || !expectedToken || token !== expectedToken) {
    console.log('Unauthorized MET API attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const metStationIds = await WeatherStationService.getStationIdsByProvider('MET');
    console.log(`Found ${metStationIds.length} MET stations`);

    if (metStationIds.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          stations: 0,
          fetched: 0,
          stored: 0,
        },
        message: 'No MET stations found in database',
      });
    }

    // Step 2: Fetch, process, and upsert data in batches
    const API_BATCH_SIZE = 200;
    let totalFetched = 0;
    let totalStored = 0;
    const errors: string[] = [];

    for (let i = 0; i < metStationIds.length; i += API_BATCH_SIZE) {
      const stationBatch = metStationIds.slice(i, i + API_BATCH_SIZE);
      const batchNumber = Math.floor(i / API_BATCH_SIZE) + 1;
      const totalBatches = Math.ceil(metStationIds.length / API_BATCH_SIZE);

      try {
        // Fetch data for this batch of stations
        const stationData = await fetchMetStationData(stationBatch);

        if (stationData.length === 0) {
          continue;
        }

        // Process the data (normalize wind direction)
        for (const station of stationData) {
          if (station.direction < 0) {
            station.direction = station.direction + 360;
          }
          if (station.direction > 360) {
            station.direction = station.direction - 360;
          }
        }

        totalFetched += stationData.length;

        // Upsert this batch to database
        const storedBatch = await Server.upsertManyStationData(stationData);
        totalStored += storedBatch.length;
        await Server.refreshLatestStationData(stationData);

        console.log(`Batch ${batchNumber}/${totalBatches}: ${storedBatch.length} records stored\n`);
      } catch (error) {
        const errorMsg = `Error processing API batch ${batchNumber}: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`\n📊 MET Data Processing Complete:`);
    console.log(
      `Stations: ${metStationIds.length} | Fetched: ${totalFetched} | New rows: ${totalStored} | Errors: ${errors.length}`
    );

    return NextResponse.json({
      success: true,
      data: {
        stations: metStationIds.length,
        fetched: totalFetched,
        stored: totalStored,
        errors: errors.length,
      },
      message: `Successfully stored ${totalStored} out of ${totalFetched} MET station data records from ${metStationIds.length} stations`,
      ...(errors.length > 0 && { errorDetails: errors }),
    });
  } catch (error) {
    console.error('Error processing MET station data:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to process MET station data',
      },
      { status: 500 }
    );
  }
}
