import { HolfuyStationData } from './zod';
import { StationData, WeatherStation } from '../supabase/types';



/**
 * Maps Holfuy API response data to StationData format for database storage
 */
export function mapHolfuyToStationData(holfuyData: HolfuyStationData[]): {
  stationData: Omit<StationData, 'id'>[], holfuyStation: Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>[]
} {
  const stationData = holfuyData.map(station => ({
    station_id: station.stationId,
    wind_speed: station.wind.speed,
    wind_gust: station.wind.gust,
    wind_min_speed: station.wind.min,
    direction: station.wind.direction,
    temperature: station.temperature,
    updated_at: station.dateTime,
  }));

  const holfuyStation: Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>[] = holfuyData.map(station => ({
    station_id: station.stationId,
    name: station.stationName,
    latitude: parseFloat(station.location.latitude),
    longitude: parseFloat(station.location.longitude),
    altitude: station.location.altitude,
    country: 'Norway',
    region: null,
    is_active: true,
  }));

  return { stationData, holfuyStation };
}
