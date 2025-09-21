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

    return data || [];
  }
  /**
   * Insert multiple station data records
   */
  static async insertMany(dataArray: Omit<StationData, 'id'>[]): Promise<StationData[]> {
    const { data, error } = await supabase
      .from('station_data')
      .insert(dataArray)
      .select();

    if (error) {
      console.error('Error inserting multiple station data records:', error);
      throw error;
    }

    return data || [];
  }

  static async compressYesterdayStationData(): Promise<any> {
    const { data, error } = await supabase.rpc('compress_yesterday_station_data_copy');

    if (error) {
      console.error('Error compressing data:', error);
      throw error;
    }

    return data;
  }
}