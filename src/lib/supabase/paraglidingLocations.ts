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

  static async getAllActiveForCache(): Promise<ParaglidingLocationForCache[]> {
    const { data, error } = await supabase
      .from('paragliding_locations')
      .select('id, latitude, longitude, n, e, s, w, ne, se, sw, nw')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching active locations for markers:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Create a new location
   */
  static async create(location: Omit<ParaglidingLocation, 'id' | 'created_at' | 'updated_at'>): Promise<ParaglidingLocation> {
    const { data, error } = await supabase
      .from('paragliding_locations')
      .insert(location)
      .select()
      .single();

    if (error) {
      console.error('Error creating location:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing location
   */
  static async update(id: string, updates: Partial<Omit<ParaglidingLocation, 'id' | 'created_at' | 'updated_at'>>): Promise<ParaglidingLocation> {
    const { data, error } = await supabase
      .from('paragliding_locations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating location:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a location (soft delete by setting is_active to false)
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('paragliding_locations')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }


}
