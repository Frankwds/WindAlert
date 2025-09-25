import { NextRequest, NextResponse } from 'next/server';
import { fetchMetStationData } from '@/lib/met/metDataClient';
import { Server } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('token');
  const expectedToken = process.env.CRON_SECRET;
  if (!token || !expectedToken || token !== expectedToken) {
    console.log('Unauthorized MET API attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Fetching and mapping MET station data...');

    // Fetch data from MET API and map to StationData format
    const stationData = await fetchMetStationData();
    console.log(`Successfully fetched ${stationData.length} records from MET API`);

    if (stationData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          fetched: 0,
          stored: 0,
        },
        message: 'No station data fetched from MET API'
      });
    }

    // Store all station data in database with pagination
    const batchSize = 100;
    let totalStored = 0;
    const errors: string[] = [];

    for (let i = 0; i < stationData.length; i += batchSize) {
      const batch = stationData.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(stationData.length / batchSize);

      try {
        console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} records)...`);

        const storedBatch = await Server.insertManyStationData(batch);
        totalStored += storedBatch.length;

        console.log(`Batch ${batchNumber} completed: ${storedBatch.length} records stored`);
      } catch (error) {
        const errorMsg = `Error storing batch ${batchNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`Successfully stored ${totalStored} out of ${stationData.length} records in database`);

    return NextResponse.json({
      success: true,
      data: {
        fetched: stationData.length,
        stored: totalStored,
        errors: errors.length,
      },
      message: `Successfully stored ${totalStored} out of ${stationData.length} MET station data records`,
      ...(errors.length > 0 && { errorDetails: errors })
    });

  } catch (error) {
    console.error('Error processing MET station data:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to process MET station data'
      },
      { status: 500 }
    );
  }
}
