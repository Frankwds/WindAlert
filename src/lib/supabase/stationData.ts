import { supabase } from './client';
import { StationData } from './types';

type LatestStationDataSource = 'latest_station_data' | 'latest_main_station_data';

export class StationDataService {
  /**
   * Get latest data for all stations from the configured latest-station source with pagination.
   * Automatically fetches all pages like weatherStations.ts
   * @param isMain - If true, fetches from the main-map scoped view
   * @param pageSize - Number of records per page (defaults to 1000)
   */
  static async getLatestStationData(isMain: boolean, pageSize: number = 1000): Promise<StationData[]> {
    let allStationData: StationData[] = [];
    let page = 0;
    let hasMoreData = true;
    const source: LatestStationDataSource = isMain ? 'latest_main_station_data' : 'latest_station_data';

    while (hasMoreData) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from(source)
        .select(
          `
          station_id,
          wind_speed,
          wind_gust,
          direction,
          temperature,
          updated_at
        `
        )
        .range(from, to);

      if (error) {
        console.error(`Error fetching latest station data on page ${page}:`, error);
        throw error;
      }

      if (data && data.length > 0) {
        // Add the fetched chunk to our main array
        allStationData = [...allStationData, ...data];
        page++;

        // If we received fewer rows than we asked for, it's the last page
        if (data.length < pageSize) {
          hasMoreData = false;
        }
      } else {
        // No more data to fetch
        hasMoreData = false;
      }
    }

    console.log(`Fetched ${allStationData.length} latest station data points from ${source}`);
    return allStationData;
  }

  /**
   * Get all historical data for a specific weather station
   * @param stationId - The station ID to fetch data for
   */
  static async getStationDataByStationId(stationId: string): Promise<StationData[]> {
    const { data, error } = await supabase
      .from('station_data')
      .select(
        `
        station_id,
        wind_speed,
        wind_gust,
        direction,
        temperature,
        updated_at
      `
      )
      .eq('station_id', stationId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error(`Error fetching station data for station ${stationId}:`, error);
      throw error;
    }

    return data || [];
  }
}
