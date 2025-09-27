import { supabase } from './client';
import { StationData } from './types';

export class StationDataService {

  /**
   * Get latest data for all stations from materialized view with pagination
   * Automatically fetches all pages like weatherStations.ts
   * @param pageSize - Number of records per page (defaults to 1000)
   */
  static async getLatestStationData(pageSize: number = 1000): Promise<StationData[]> {
    let allStationData: StationData[] = [];
    let page = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      const { data, error } = await supabase
        .from('latest_station_data_materialized')
        .select(`
          station_id,
          wind_speed,
          wind_gust,
          direction,
          temperature,
          updated_at
        `)
        .range(from, to);

      if (error) {
        console.error(`Error fetching latest station data from materialized view on page ${page}:`, error);
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

    console.log(`Fetched ${allStationData.length} latest station data points from materialized view`);
    return allStationData;
  }
}