import { supabase } from './client';
import { ForecastCache1hr } from './types';

export class ForecastCacheService {
  /**
   * Get forecast data for a specific location and time range
   */
  static async getByLocationAndTimeRange(
    locationId: string,
    startTime: string,
    endTime: string
  ): Promise<ForecastCache1hr[]> {
    const { data, error } = await supabase
      .from('forecast_cache')
      .select('*')
      .eq('location_id', locationId)
      .gte('time', startTime)
      .lte('time', endTime)
      .order('time');

    if (error) {
      console.error('Error fetching forecast data:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get the latest forecast data for a specific location
   */
  static async getLatestByLocation(locationId: string): Promise<ForecastCache1hr | null> {
    const { data, error } = await supabase
      .from('forecast_cache')
      .select('*')
      .eq('location_id', locationId)
      .order('time', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Error fetching latest forecast data:', error);
      return null;
    }

    return data;
  }

  /**
   * Get all forecast data for a specific location
   */
  static async getAllByLocation(locationId: string): Promise<ForecastCache1hr[]> {
    const { data, error } = await supabase
      .from('forecast_cache')
      .select('*')
      .eq('location_id', locationId)
      .order('time');

    if (error) {
      console.error('Error fetching all forecast data for location:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Clear all forecast data from the cache
   * Call this at the start of a full refresh cycle
   */
  static async clearAllForecastData(): Promise<void> {
    const { error } = await supabase
      .from('forecast_cache')
      .delete()
      .gte('time', '1900-01-01'); // Delete all rows (condition that's always true for valid timestamps)

    if (error) {
      console.error('Error clearing all forecast data:', error);
      throw error;
    }
  }

  /**
   * Insert forecast data (assumes table has been cleared)
   * More efficient when doing a full refresh of all forecast data
   */
  static async insertForecastData(forecastData: ForecastCache1hr[]): Promise<void> {
    if (forecastData.length === 0) return;

    const { error } = await supabase
      .from('forecast_cache')
      .insert(forecastData);

    if (error) {
      console.error('Error inserting forecast data:', error);
      throw error;
    }
  }


  /**
   * Upsert forecast data (insert or update)
   * @param forecastData 
   */
  static async upsert(forecastData: ForecastCache1hr[]): Promise<void> {
    const { error } = await supabase
      .from('forecast_cache')
      .upsert(forecastData, { onConflict: 'time,location_id' });

    if (error) {
      console.error('Error upserting forecast data:', error);
      throw error;
    }
  }

  /**
   * Delete old forecast data before a specific time
   */
  static async deleteOldData(beforeTime: string): Promise<void> {
    const { error } = await supabase
      .from('forecast_cache')
      .delete()
      .lt('time', beforeTime);

    if (error) {
      console.error('Error deleting old forecast data:', error);
      throw error;
    }
  }

  /**
   * Get promising forecast data for a specific location
   */
  static async getPromisingForecasts(locationId: string): Promise<ForecastCache1hr[]> {
    const { data, error } = await supabase
      .from('forecast_cache')
      .select('*')
      .eq('location_id', locationId)
      .eq('isPromising', true)
      .order('time');

    if (error) {
      console.error('Error fetching promising forecasts:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get forecast data for multiple locations at a specific time
   */
  static async getByTimeAndLocations(
    time: string,
    locationIds: string[]
  ): Promise<ForecastCache1hr[]> {
    const { data, error } = await supabase
      .from('forecast_cache')
      .select('*')
      .eq('time', time)
      .in('location_id', locationIds);

    if (error) {
      console.error('Error fetching forecast data by time and locations:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get the last updated forecast data (oldest date in the cache)
   */
  static async getLastUpdated(): Promise<ForecastCache1hr | null> {
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
}
