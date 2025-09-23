import { supabase } from './client';
import { WeatherStationWithData } from './types';

export class WeatherStationService {


  /**
   * Find which station IDs from the provided list don't exist in the database
   * Uses IN to find existing IDs, then filters to find missing ones
   */
  static async getAllMissingStationIds(stationIds: number[]): Promise<number[]> {
    if (stationIds.length === 0) return [];

    // Query to find which station IDs from our list DO exist in the database
    const { data, error } = await supabase
      .from('weather_stations')
      .select('station_id')
      .in('station_id', stationIds);

    if (error) {
      console.error('Error finding existing station IDs:', error);
      throw error;
    }

    // Return station IDs that are in our list but NOT in the database
    const existingIds = data?.map(row => row.station_id) || [];
    return stationIds.filter(id => !existingIds.includes(id));
  }


  /**
 * Get all active weather stations that have data in station_data table
 */
  static async getAllActiveWithData(): Promise<WeatherStationWithData[]> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select(`
          id,
          station_id,
          name,
          latitude,
          longitude,
          altitude,
          station_data!inner(
            id,
            station_id,
            wind_speed,
            wind_gust,
            wind_min_speed,
            direction,
            temperature,
            updated_at
          )
        `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching active weather stations with data:', error);
      throw error;
    }
    console.log(`Fetched ${data?.length} active weather stations with data`);

    // Convert to WeatherStationMarkerData format
    return data || [];
  }
}