import { NextRequest, NextResponse } from 'next/server';
import { fetchHolfuyData } from '@/lib/holfuy/apiClient';
import { StationDataService } from '@/lib/supabase/stationData';
import { WeatherStationService } from '@/lib/supabase/weatherStations';

export async function GET(request: NextRequest) {
  const token = request.headers.get('token');
  const expectedToken = process.env.CRON_SECRET;
  if (!token || !expectedToken || token !== expectedToken) {
    console.log('Unauthorized Holfuy API attempt');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('Fetching and mapping Holfuy data...');

    // Get valid station IDs from weather_stations table
    const validStationIds = await WeatherStationService.getAllStationIdsNorway();
    console.log(`Found ${validStationIds.length} valid station IDs in database`);

    // Fetch data from Holfuy API and map to StationData format
    const holfuyData = await fetchHolfuyData();
    console.log(`Successfully fetched ${holfuyData.length} records from Holfuy API`);

    // Filter data to only include stations that exist in weather_stations table
    const filteredData = holfuyData.filter(station =>
      validStationIds.includes(station.station_id)
    );

    const stationsNeedingImport = holfuyData
      .filter(station => !validStationIds.includes(station.station_id))
      .map(station => station.station_id)
      .filter(id => ![113, 612, 689, 1154, 1514, 1876].includes(id));

    if (stationsNeedingImport.length > 0) {
      console.log(`${stationsNeedingImport.length} stations need to be imported:`, stationsNeedingImport);
    }

    console.log(`Processing ${filteredData.length} valid records for database storage`);

    // Store filtered data in database
    const storedData = await StationDataService.insertMany(filteredData);
    console.log(`Successfully stored ${storedData.length} records in database`);

    return NextResponse.json({
      success: true,
      data: {
        fetched: holfuyData.length,
        filtered: filteredData.length,
        filteredOut: stationsNeedingImport.length,
        filteredOutIds: stationsNeedingImport,
        stored: storedData.length,
      },
      message: `Successfully fetched ${holfuyData.length} stations, filtered to ${filteredData.length} valid stations, and stored ${storedData.length} records`
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
