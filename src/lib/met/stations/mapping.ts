import { MetFrostStation } from './zod';
import { WeatherStation } from '../../supabase/types';

/**
 * Maps Met Frost API response data to WeatherStation format for database storage
 */
export function mapMetFrostToWeatherStation(
  metFrostData: MetFrostStation[]
): Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>[] {
  return metFrostData
    .filter(station => {
      // Filter out stations with invalid or missing coordinates
      if (!station.geometry || !station.geometry.coordinates) {
        return false;
      }

      const [longitude, latitude] = station.geometry.coordinates;
      return (
        longitude !== 0 && latitude !== 0 && latitude >= -90 && latitude <= 90 && longitude >= -180 && longitude <= 180
      );
    })
    .map(station => {
      const [longitude, latitude] = station.geometry!.coordinates;

      return {
        station_id: station.id,
        name: station.name || station.id, // Use station ID as fallback if name is null
        latitude: parseFloat(latitude.toFixed(4)),
        longitude: parseFloat(longitude.toFixed(4)),
        altitude: station.masl || 0,
        country: station.country || 'UKJENT',
        is_active: true,
        provider: 'MET',
        is_main: station.country === 'Norge',
      };
    });
}
