import { supabase } from './client';
import { ParaglidingLocation, ParaglidingMarkerData } from './types';

export class AllParaglidingLocationService {

  /**
   * Get all active paragliding locations
   */
  static async getAllActive(): Promise<ParaglidingLocation[]> {
    const { data, error } = await supabase
      .from('all_paragliding_locations')
      .select('*')
      .eq('is_active', true)
      .limit(5000);

    if (error) {
      console.error('Error fetching active locations:', error);
      throw error;
    }

    return data || [];
  }

  /**
  * Get ALL active paragliding locations using pagination.
  */
  static async getAllActiveForMarkers(): Promise<ParaglidingMarkerData[]> {
    const PAGE_SIZE = 1000;
    let allLocations: ParaglidingMarkerData[] = [];
    let page = 0;
    let hasMoreData = true;

    while (hasMoreData) {
      const from = page * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error } = await supabase
        .from('all_paragliding_locations')
        .select(`
        id, name, latitude, longitude, altitude, n, e, s, w, ne, se, sw, nw
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
   * Get a single paragliding location by its flightlog ID
   */
  static async getByFlightlogId(flightlogId: string): Promise<ParaglidingLocation | null> {
    const { data, error } = await supabase
      .from('all_paragliding_locations')
      .select('*')
      .eq('flightlog_id', flightlogId)
      .maybeSingle();

    if (error) {
      console.error(`Error fetching location with flightlog_id ${flightlogId}:`, error);
      return null;
    }

    return data;
  }

  /**
   * Create a new location
   */
  static async create(location: Omit<ParaglidingLocation, 'id' | 'created_at' | 'updated_at'>): Promise<ParaglidingLocation> {
    const { data, error } = await supabase
      .from('all_paragliding_locations')
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
      .from('all_paragliding_locations')
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
      .from('all_paragliding_locations')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting location:', error);
      throw error;
    }
  }

}
