import { supabase } from './client';
import { ParaglidingLocation, ParaglidingLocationForCache, ParaglidingMarkerData } from './types';

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
  static async getMainActiveByIds(ids: string[]): Promise<ParaglidingLocationForCache[]> {
    const { data, error } = await supabase
      .from('all_paragliding_locations')
      .select('id, latitude, longitude, n, e, s, w, ne, se, sw, nw')
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
  static async getAllActiveMainForMarkersWithForecast(): Promise<ParaglidingMarkerData[]> {
    const now = new Date();
    const { data, error } = await supabase
      .from('all_paragliding_locations')
      .select(`
        id, name, latitude, flightlog_id, longitude, altitude, n, e, s, w, ne, se, sw, nw,
        forecast_cache(
          time,
          is_day,
          weather_code,
          temperature,
          wind_speed,
          wind_gusts,
          wind_direction,
          is_promising
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

    return (data as ParaglidingMarkerData[]) || [];
  }
}
