import { supabase } from './client';
import { StationData } from './types';

export class StationDataService {

  /**
   * Get latest data for all stations from materialized view
   * Optionally filter by country for main page
   */
  static async getLatestStationData(isMain?: boolean): Promise<StationData[]> {
    let query = supabase
      .from('latest_station_data_materialized')
      .select(`
        id,
        station_id,
        wind_speed,
        wind_gust,
        wind_min_speed,
        direction,
        temperature,
        updated_at,
        weather_stations!inner(country)
      `);

    // Filter by country if this is the main page (Norway/Norge only)
    if (isMain) {
      query = query.in('weather_stations.country', ['Norway', 'Norge']);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching latest station data from materialized view:', error);
      throw error;
    }

    console.log(`Fetched ${data?.length} latest station data points from materialized view`);
    return data || [];
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