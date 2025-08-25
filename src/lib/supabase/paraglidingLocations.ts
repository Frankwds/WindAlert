import { supabase } from './client';
import { ParaglidingLocation } from './types';

export class ParaglidingLocationService {
  /**
   * Get all active paragliding locations
   */
  static async getAllActive(): Promise<ParaglidingLocation[]> {
    const { data, error } = await supabase
      .from('paragliding_locations')
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
   * Get locations by country
   */
  static async getByCountry(country: string): Promise<ParaglidingLocation[]> {
    const { data, error } = await supabase
      .from('paragliding_locations')
      .select('*')
      .eq('country', country)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching locations by country:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get locations within a bounding box (for map views)
   */
  static async getWithinBounds(
    north: number,
    south: number,
    east: number,
    west: number
  ): Promise<ParaglidingLocation[]> {
    const { data, error } = await supabase
      .from('paragliding_locations')
      .select('*')
      .eq('is_active', true)
      .gte('latitude', south)
      .lte('latitude', north)
      .gte('longitude', west)
      .lte('longitude', east)
      .order('name');

    if (error) {
      console.error('Error fetching locations within bounds:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get locations within a certain radius of a point (in kilometers)
   */
  static async getWithinRadius(
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): Promise<ParaglidingLocation[]> {
    // Using Haversine formula for distance calculation
    // This is a simplified approach - for production, consider using PostGIS
    const { data, error } = await supabase
      .from('paragliding_locations')
      .select('*')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching locations for radius search:', error);
      throw error;
    }

    if (!data) return [];

    // Filter locations within radius using Haversine formula
    return data.filter(location => {
      const distance = this.calculateDistance(
        centerLat,
        centerLng,
        location.latitude,
        location.longitude
      );
      return distance <= radiusKm;
    });
  }

  /**
   * Search locations by name or description
   */
  static async search(query: string): Promise<ParaglidingLocation[]> {
    const { data, error } = await supabase
      .from('paragliding_locations')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('name');

    if (error) {
      console.error('Error searching locations:', error);
      throw error;
    }

    return data || [];
  }



  /**
   * Get a single location by ID
   */
  static async getById(id: string): Promise<ParaglidingLocation | null> {
    const { data, error } = await supabase
      .from('paragliding_locations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching location by ID:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get a single location by flightlog ID
   */
  static async getByFlightlogId(flightlogId: string): Promise<ParaglidingLocation | null> {
    const { data, error } = await supabase
      .from('paragliding_locations')
      .select('*')
      .eq('flightlog_id', flightlogId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching location by flightlog ID:', error);
      throw error;
    }

    return data;
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

  /**
   * Calculate distance between two points using Haversine formula
   * @param lat1 Latitude of first point
   * @param lon1 Longitude of first point
   * @param lat2 Latitude of second point
   * @param lon2 Longitude of second point
   * @returns Distance in kilometers
   */
  private static calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) * Math.cos(this.toRadians(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private static toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }
}
