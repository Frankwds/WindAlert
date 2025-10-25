import { supabase } from './client';
import { WeatherStationWithData, WeatherStation } from './types';

export class WeatherStationService {
  /**
   * Get all station IDs for a specific provider with pagination
   */
  static async getStationIdsByProvider(provider: string): Promise<string[]> {
    const PAGE_SIZE = 1000;
    let allStationIds: string[] = [];
    let page = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('weather_stations')
        .select('station_id')
        .eq('provider', provider)
        .eq('is_active', true)
        .range(from, to); // 👈 Use range for pagination

      if (error) {
        console.error(`Error fetching station IDs by provider on page ${page}:`, error);
        throw error;
      }

      if (data && data.length > 0) {
        // Add the fetched chunk to our main array
        const pageStationIds = data.map(row => row.station_id);
        allStationIds = [...allStationIds, ...pageStationIds];
        page++;

        // If we received fewer rows than we asked for, it's the last page
        if (data.length < PAGE_SIZE) {
          hasMoreData = false;
        }
      } else {
        // No more data to fetch
        hasMoreData = false;
      }
    }

    console.log(`Total station IDs fetched for provider '${provider}': ${allStationIds.length}`);
    return allStationIds;
  }

  /**
   * Find which station IDs from the provided list don't exist in the database
   * Uses IN to find existing IDs, then filters to find missing ones
   */
  static async getAllMissingStationIds(stationIds: string[]): Promise<string[]> {
    if (stationIds.length === 0) return [];

    // Query to find which station IDs from our list DO exist in the database
    const { data, error } = await supabase.from('weather_stations').select('station_id').in('station_id', stationIds);

    if (error) {
      console.error('Error finding existing station IDs:', error);
      throw error;
    }

    // Return station IDs that are in our list but NOT in the database
    const existingIds = data?.map(row => row.station_id) || [];
    return stationIds.filter(id => !existingIds.includes(id));
  }

  /**
   * Get all active weather stations metadata (without station_data)
   * Uses pagination to fetch 1000 records at a time
   * @param isMain - If true, filters to only Norway/Norge stations
   */
  static async getAllActive(isMain: boolean): Promise<WeatherStation[]> {
    const PAGE_SIZE = 1000;
    let allStations: WeatherStation[] = [];
    let page = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const query = supabase
        .from('weather_stations')
        .select(
          `
            id,
            station_id,
            name,
            latitude,
            longitude,
            altitude,
            provider,
            is_main,
            country,
            is_active,
            updated_at
          `
        )
        .eq('is_active', true);

      // Only filter by is_main if isMain is true
      if (isMain) {
        query.eq('is_main', true);
      }

      const { data, error } = await query.range(from, to);

      if (error) {
        console.error(`Error fetching active weather stations on page ${page}:`, error);
        throw error;
      }

      if (data && data.length > 0) {
        // Add the fetched chunk to our main array
        allStations = [...allStations, ...data];
        page++;

        // If we received fewer rows than we asked for, it's the last page
        if (data.length < PAGE_SIZE) {
          hasMoreData = false;
        }
      } else {
        // No more data to fetch
        hasMoreData = false;
      }
    }

    console.log(`Fetched ${allStations.length} active weather stations metadata`);
    return allStations;
  }

  /**
   * Get all active weather stations that have data in station_data table
   * Optimized to use indexes efficiently by filtering station_data on recent data
   * Uses pagination to fetch 1000 records at a time
   * @param isMain - If true, filters to only Norway/Norge stations
   * @deprecated This method is no longer used. Use getAllActive() instead for better performance.
   */
  static async getAllActiveWithData(isMain: boolean): Promise<WeatherStationWithData[]> {
    const PAGE_SIZE = 500;
    let allStations: WeatherStationWithData[] = [];
    let page = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const query = supabase
        .from('weather_stations')
        .select(
          `
            id,
            station_id,
            name,
            latitude,
            longitude,
            altitude,
            provider,
            is_main,
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
          `
        )
        .eq('is_active', true);

      // Only filter by is_main if isMain is true
      if (isMain) {
        query.eq('is_main', true);
      }

      const { data, error } = await query.range(from, to); // 👈 Use range for pagination

      if (error) {
        console.error(`Error fetching active weather stations with data on page ${page}:`, error);
        throw error;
      }

      if (data && data.length > 0) {
        // Add the fetched chunk to our main array
        allStations = [...allStations, ...data];
        page++;

        // If we received fewer rows than we asked for, it's the last page
        if (data.length < PAGE_SIZE) {
          hasMoreData = false;
        }
      } else {
        // No more data to fetch
        hasMoreData = false;
      }
    }

    console.log(`Fetched ${allStations.length} active weather stations with data`);
    return allStations;
  }
}
