import { supabase } from './client';
import { WeatherStation } from './types';

export class WeatherStationService {
  /**
   * Get total count of active weather stations
   */
  static async getCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('weather_stations')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) {
        console.error('Error fetching weather stations count:', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      console.error('Error in getCount:', error);
      return 0;
    }
  }

  /**
   * Get all active weather stations
   */
  static async getAllActive(): Promise<WeatherStation[]> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching active weather stations:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get all active weather stations with coordinates (for mapping)
   * This is more efficient than getAllActive when you only need stations with coordinates
   */
  static async getAllActiveWithCoordinates(): Promise<WeatherStation[]> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('*')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('name');

    if (error) {
      console.error('Error fetching active weather stations with coordinates:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get weather stations by country
   */
  static async getByCountry(country: string): Promise<WeatherStation[]> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('*')
      .eq('country', country)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching weather stations by country:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get weather stations within a bounding box (for map views)
   * 
   * Database optimization: Ensure you have a composite index on:
   * CREATE INDEX idx_weather_stations_bounds ON weather_stations 
   * (is_active, latitude, longitude) WHERE is_active = true AND latitude IS NOT NULL AND longitude IS NOT NULL;
   */
  static async getWithinBounds(
    north: number,
    south: number,
    east: number,
    west: number
  ): Promise<WeatherStation[]> {
    try {
      const { data, error } = await supabase
        .from('weather_stations')
        .select('*')
        .eq('is_active', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null)
        .gte('latitude', south)
        .lte('latitude', north)
        .gte('longitude', west)
        .lte('longitude', east)
        .order('name');
      // Removed limit to allow fetching all locations

      if (error) {
        console.error('Error fetching weather stations within bounds:', error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error('Error in getWithinBounds:', error);
      return [];
    }
  }

  /**
   * Get weather stations within a certain radius of a point (in kilometers)
   */
  static async getWithinRadius(
    centerLat: number,
    centerLng: number,
    radiusKm: number
  ): Promise<WeatherStation[]> {
    // Using Haversine formula for distance calculation
    // This is a simplified approach - for production, consider using PostGIS
    const { data, error } = await supabase
      .from('weather_stations')
      .select('*')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null);

    if (error) {
      console.error('Error fetching weather stations for radius search:', error);
      throw error;
    }

    if (!data) return [];

    // Filter stations within radius using Haversine formula
    return data.filter(station => {
      if (!station.latitude || !station.longitude) return false;

      const distance = this.calculateDistance(
        centerLat,
        centerLng,
        station.latitude,
        station.longitude
      );
      return distance <= radiusKm;
    });
  }

  /**
   * Search weather stations by name
   */
  static async search(query: string): Promise<WeatherStation[]> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('*')
      .eq('is_active', true)
      .or(`name.ilike.%${query}%`)
      .order('name');

    if (error) {
      console.error('Error searching weather stations:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get a single weather station by ID
   */
  static async getById(id: string): Promise<WeatherStation | null> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching weather station by ID:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get a single weather station by station ID
   */
  static async getByStationId(stationId: string): Promise<WeatherStation | null> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('*')
      .eq('station_id', stationId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching weather station by station ID:', error);
      throw error;
    }

    return data;
  }

  /**
   * Create a new weather station
   */
  static async create(station: Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>): Promise<WeatherStation> {
    const { data, error } = await supabase
      .from('weather_stations')
      .insert(station)
      .select()
      .single();

    if (error) {
      console.error('Error creating weather station:', error);
      throw error;
    }

    return data;
  }

  /**
   * Update an existing weather station
   */
  static async update(id: string, updates: Partial<Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>>): Promise<WeatherStation> {
    const { data, error } = await supabase
      .from('weather_stations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating weather station:', error);
      throw error;
    }

    return data;
  }

  /**
   * Delete a weather station (soft delete by setting is_active to false)
   */
  static async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('weather_stations')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      console.error('Error deleting weather station:', error);
      throw error;
    }
  }

  /**
   * Get weather stations with coordinates (for mapping)
   */
  static async getWithCoordinates(): Promise<WeatherStation[]> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('*')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('name');

    if (error) {
      console.error('Error fetching weather stations with coordinates:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get weather stations by region
   */
  static async getByRegion(region: string): Promise<WeatherStation[]> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('*')
      .eq('region', region)
      .eq('is_active', true)
      .order('name');

    if (error) {
      console.error('Error fetching weather stations by region:', error);
      throw error;
    }

    return data || [];
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
