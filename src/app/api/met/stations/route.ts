import { NextRequest, NextResponse } from 'next/server';
import { fetchMetFrostStations } from '@/lib/met/apiClient';
import { Server } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const token = request.headers.get('token');
  const expectedToken = process.env.CRON_SECRET;
  if (!token || !expectedToken || token !== expectedToken) {
    console.log('Unauthorized Met stations API attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Fetching Met Frost stations...');

    // Fetch all stations from Met Frost API
    const allStations = await fetchMetFrostStations();
    console.log(`Successfully fetched ${allStations.length} stations from Met Frost API`);

    if (allStations.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          fetched: 0,
          upserted: 0,
        },
        message: 'No stations fetched from Met Frost API'
      });
    }

    // Upsert stations in batches of 100
    const batchSize = 100;
    let totalUpserted = 0;
    const errors: string[] = [];

    for (let i = 0; i < allStations.length; i += batchSize) {
      const batch = allStations.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(allStations.length / batchSize);

      try {
        console.log(`Processing batch ${batchNumber}/${totalBatches} (${batch.length} stations)...`);

        const upsertedStations = await Server.upsertManyWeatherStation(batch);
        totalUpserted += upsertedStations.length;

        console.log(`Batch ${batchNumber} completed: ${upsertedStations.length} stations upserted`);
      } catch (error) {
        const errorMsg = `Error upserting batch ${batchNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        errors.push(errorMsg);
      }
    }

    console.log(`Successfully upserted ${totalUpserted} out of ${allStations.length} stations`);

    return NextResponse.json({
      success: true,
      data: {
        fetched: allStations.length,
        upserted: totalUpserted,
        errors: errors.length,
      },
      message: `Successfully upserted ${totalUpserted} out of ${allStations.length} Met Frost stations`,
      ...(errors.length > 0 && { errorDetails: errors })
    });

  } catch (error) {
    console.error('Error processing Met Frost stations:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to process Met Frost stations'
      },
      { status: 500 }
    );
  }
}
