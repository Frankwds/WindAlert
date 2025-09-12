import { supabase } from './client';
import { ParaglidingLocation } from './types';

export class AllParaglidingLocationService {

  /**
   * Get all active paragliding locations
   */
  static async getAllActive(): Promise<ParaglidingLocation[]> {
    const { data, error } = await supabase
      .from('all_paragliding_locations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching active locations:', error);
      throw error;
    }

    return data || [];
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
