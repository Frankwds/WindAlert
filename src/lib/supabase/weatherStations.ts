import { supabase } from './client';
import { StationData, WeatherStation, WeatherStationMarkerData } from './types';
import { calculateDistance } from './utils';

export class WeatherStationService {

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
 * Get all active weather stations that have data in station_data table
 */
  static async getAllActiveWithData(): Promise<WeatherStationMarkerData[]> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select(`
          id,
          station_id,
          name,
          latitude,
          longitude,
          altitude,
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
        `)
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching active weather stations with data:', error);
      throw error;
    }

    // Convert to WeatherStationMarkerData format
    return data || [];
  }


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

      const distance = calculateDistance(
        centerLat,
        centerLng,
        station.latitude,
        station.longitude
      );
      return distance <= radiusKm;
    });
  }

  static async getByStationId(stationId: number): Promise<WeatherStation | null> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('*')
      .eq('station_id', stationId)
      .maybeSingle();
    if (error) {
      console.error('Error fetching weather station by station ID:', error);
      throw error;
    }

    return data || null;
  }

  static async insert(station: Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>): Promise<WeatherStation | null> {
    const { data, error } = await supabase
      .from('weather_stations')
      .insert(station)
      .select()
      .single();
    if (error) {
      console.error('Error inserting weather station:', error);
      throw error;
    }

    return data || null;
  }

  /**
   * Get all unique station IDs from weather_stations table
   */
  static async getAllStationIdsNorway(): Promise<number[]> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('station_id')
      .eq('country', 'Norway')
      .eq('is_active', true);

    if (error) {
      console.error('Error fetching station IDs:', error);
      throw error;
    }

    return data?.map(station => station.station_id) || [];
  }
}