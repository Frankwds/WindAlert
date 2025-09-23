import { supabase } from './client';
import { ParaglidingLocation, MinimalParaglidingLocation, ParaglidingLocationWithForecast } from './types';

export class ParaglidingLocationService {

  /**
   * Get a single paragliding location by its ID
   */
  static async getById(id: string): Promise<ParaglidingLocation | null> {
    const { data, error } = await supabase
      .from('all_paragliding_locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error(`Error fetching location with id ${id}:`, error);
      return null;
    }

    return data;
  }

  /**
   * Get multiple paragliding locations by their IDs
   */
  static async getMainActiveByIds(ids: string[]): Promise<MinimalParaglidingLocation[]> {
    const { data, error } = await supabase
      .from('all_paragliding_locations')
      .select('id, latitude, longitude, n, e, s, w, ne, se, sw, nw, landing_latitude, landing_longitude, landing_altitude')
      .in('id', ids)
      .eq('is_active', true)
      .eq('is_main', true);

    if (error) {
      console.error(`Error fetching locations with ids ${ids.join(', ')}:`, error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get all active paragliding locations optimized for markers, with the next 12 hours of forecast data
   */
  static async getAllMainLocationsWithForecast(): Promise<ParaglidingLocationWithForecast[]> {
    const now = new Date();
    const { data, error } = await supabase
      .from('all_paragliding_locations')
      .select(`
        id, name, latitude, flightlog_id, longitude, altitude, n, e, s, w, ne, se, sw, nw,
        landing_latitude, landing_longitude, landing_altitude,
        forecast_cache(
          time,
          is_day,
          weather_code,
          temperature,
          wind_speed,
          wind_gusts,
          wind_direction,
          is_promising,
          landing_wind,
          landing_gust,
          landing_wind_direction
        )
      `)
      .eq('is_active', true)
      .eq('is_main', true)
      .gte('forecast_cache.time', now.toISOString())
      .order('name');

    if (error) {
      console.error('Error fetching active locations for markers with forecast:', error);
      throw error;
    }
    console.log(`Fetched ${data?.length} active locations with forecast`);

    return (data as ParaglidingLocationWithForecast[]) || [];
  }


  /**
* Get ALL active paragliding locations using pagination.
*/
  static async getAllActiveLocations(): Promise<ParaglidingLocationWithForecast[]> {
    const PAGE_SIZE = 1000;
    let allLocations: ParaglidingLocationWithForecast[] = [];
    let page = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('all_paragliding_locations')
        .select(`
          id, name, latitude, longitude, altitude, flightlog_id, n, e, s, w, ne, se, sw, nw, is_main, 
          landing_latitude, landing_longitude, landing_altitude
        `)
        .eq('is_active', true)
        .range(from, to); // 👈 Use range for pagination

      if (error) {
        console.error(`Error fetching locations on page ${page}:`, error);
        throw error;
      }

      if (data && data.length > 0) {
        // Add the fetched chunk to our main array
        allLocations = [...allLocations, ...data];
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
    console.log(`Fetched ${allLocations?.length} active locations for markers`);

    return allLocations;
  }
}
