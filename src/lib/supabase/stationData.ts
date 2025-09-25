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
          id,
          station_id,
          wind_speed,
          wind_gust,
          wind_min_speed,
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


  // RETURNS TABLE(
  //   original_records INTEGER,
  //   compressed_records INTEGER,
  //   stations_processed INTEGER
  // )
  static async compressYesterdayStationData(): Promise<{
    original_records: number, compressed_records: number, stations_processed: number
  }> {
    const { data, error } = await supabase.rpc('compress_yesterday_station_data');

    if (error) {
      console.error('Error compressing data:', error);
      throw error;
    }

    return data && data.length > 0 ?
      data[0] : { original_records: 0, compressed_records: 0, stations_processed: 0 }
  }

  /**
   * Delete station data older than 2 days from the start of the day
   */
  static async deleteAllOlderThanTwoDays(): Promise<{ deleted_records: number }> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 1); // Minus one day because of timezones and the server US home.
    cutoffDate.setHours(0, 0, 0, 0); // Start of day

    const { data, error } = await supabase
      .from('station_data')
      .delete()
      .lt('updated_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Error deleting old station data:', error);
      throw error;
    }

    return { deleted_records: data?.length || 0 };
  }
}