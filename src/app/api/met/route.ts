import { NextRequest, NextResponse } from 'next/server';
import { fetchMetStationData } from '@/lib/met/metDataClient';
import { Server } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  // const token = request.headers.get('token');
  // const expectedToken = process.env.CRON_SECRET;
  // if (!token || !expectedToken || token !== expectedToken) {
  //   console.log('Unauthorized MET API attempt');
  //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  // }

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

    // Store all station data in database
    const storedData = await Server.insertManyStationData(stationData);
    console.log(`Successfully stored ${storedData.length} records in database`);

    return NextResponse.json({
      success: true,
      data: {
        fetched: stationData.length,
        stored: storedData.length,
      },
      message: `Successfully stored ${storedData.length} MET station data records`
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
