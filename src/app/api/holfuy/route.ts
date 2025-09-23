import { NextRequest, NextResponse } from 'next/server';
import { fetchHolfuyData } from '@/lib/holfuy/apiClient';
import { StationDataService } from '@/lib/supabase/stationData';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
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

    // Find which stations are missing from the database
    const stationIds = [...new Set(holfuyStation.map(station => station.station_id))];
    const missingStationIds = await WeatherStationService.getAllMissingStationIds(stationIds);

    if (missingStationIds.length > 0) {
      console.log(`Found ${missingStationIds.length} new stations to upsert: ${missingStationIds.join(', ')}`);

      // Filter holfuyStation to only include missing stations
      const newStations = holfuyStation.filter(station =>
        missingStationIds.includes(station.station_id)
      );

      // Upsert only the missing stations
      await Server.upsertMany(newStations);
      console.log(`Successfully upserted ${newStations.length} new stations`);
    }

    // Store all station data in database
    const storedData = await StationDataService.insertMany(stationData);
    console.log(`Successfully stored ${storedData.length} records in database`);

    return NextResponse.json({
      success: true,
      data: {
        fetched: stationData.length,
        stored: storedData.length,
        newStations: missingStationIds.length,
      },
      message: `Successfully stored ${storedData.length} records and upserted ${missingStationIds.length} new stations`
    });

  } catch (error) {
    console.error('Error processing Holfuy data:', error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        message: 'Failed to process Holfuy data'
      },
      { status: 500 }
    );
  }
}
