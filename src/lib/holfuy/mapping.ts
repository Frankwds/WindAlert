import { HolfuyStationData } from './types';
import { StationData } from '../supabase/types';



/**
 * Maps Holfuy API response data to StationData format for database storage
 */
export function mapHolfuyToStationData(holfuyData: HolfuyStationData[]): Omit<StationData, 'id'>[] {
  return holfuyData.map(station => ({
    station_id: station.stationId,
    wind_speed: station.wind.speed,
    wind_gust: station.wind.gust,
    wind_min_speed: station.wind.min,
    direction: station.wind.direction,
    temperature: station.temperature,
    updated_at: station.dateTime,
  }));
}
