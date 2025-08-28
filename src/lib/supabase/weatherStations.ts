import { supabase } from './client';
import { WeatherStation, WeatherStationMarkerData } from './types';
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
   * Get all active weather stations optimized for markers (only essential fields)
   */
  static async getAllActiveForMarkers(): Promise<WeatherStationMarkerData[]> {
    const { data, error } = await supabase
      .from('weather_stations')
      .select('id, station_id, name, latitude, longitude, altitude')
      .eq('is_active', true)
      .not('latitude', 'is', null)
      .not('longitude', 'is', null)
      .order('name');

    if (error) {
      console.error('Error fetching active weather stations for markers:', error);
      throw error;
    }

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

}
