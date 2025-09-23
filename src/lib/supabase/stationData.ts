import { supabase } from './client';
import { StationData } from './types';

export class StationDataService {

  /**
   * Get latest data for all stations newer than a given timestamp
   */
  static async getAllStationDataNewerThan(timestamp: string): Promise<StationData[]> {
    // check that timestamp is older than 15 minutes
    if (new Date(timestamp).getTime() > Date.now() - 15 * 60 * 1000) {
      return [];
    }


    // Add 2 minutes buffer to the timestamp to account for potential delays
    const bufferedTimestamp = new Date(new Date(timestamp).getTime() + 2 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('station_data')
      .select('*')
      .gt('updated_at', bufferedTimestamp)

    if (error) {
      console.error('Error fetching latest data for all stations:', error);
      throw error;
    }
    console.log(`Fetched ${data?.length} station data newer than ${bufferedTimestamp}`);
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
    cutoffDate.setDate(cutoffDate.getDate() - 2);
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