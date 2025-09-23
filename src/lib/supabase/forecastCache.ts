import { supabase } from './client';
import { ForecastCache1hr } from './types';

export class ForecastCacheService {



  /**
   * Get the last updated forecast data (oldest date in the cache)
   */
  static async getOldestForecastData(): Promise<ForecastCache1hr | null> {
    const { data, error } = await supabase
      .from('forecast_cache')
      .select('*')
      .order('updated_at', { ascending: true })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching last updated forecast data:', error);
      return null;
    }

    return data;
  }

  /**
   * Get locations with oldest forecast data (for staggered updates)
   */
  static async getLocationsWithOldestForecastData(limit: number): Promise<string[]> {
    const { data, error } = await supabase
      .from('locations_with_oldest_forecast')
      .select('location_id')
      .limit(limit);

    if (error) {
      console.error('Error fetching locations with oldest forecast data:', error);
      throw error;
    }
    if (data?.length != limit) {
      throw new Error(`Expected ${limit} locations, got ${data?.length}`);
    }
    return data?.map(row => row.location_id) || [];
  }

  /**
   * Get locations with no forecast data
   */
  static async getLocationsWithNoForecastData(limit: number): Promise<string[]> {
    const { data, error } = await supabase
      .from('locations_without_forecast')
      .select('location_id')
      .limit(limit);

    if (error) {
      console.error('Error fetching locations with no forecast data:', error);
      throw error;
    }

    return data?.map(row => row.location_id) || [];
  }
}
