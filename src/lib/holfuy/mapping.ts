import { HolfuyStationData } from './types';
import { StationData } from '../supabase/types';

/**
 * Rounds a datetime string to the nearest quarter hour (00, :15, :30, :45)
 */
function roundToQuarterHour(dateTimeString: string): string {
  const date = new Date(dateTimeString);
  const minutes = date.getMinutes();

  // Round to nearest quarter hour
  const roundedMinutes = Math.round(minutes / 15) * 15;

  // Handle hour overflow when rounding up
  if (roundedMinutes === 60) {
    date.setHours(date.getHours() + 1);
    date.setMinutes(0);
  } else {
    date.setMinutes(roundedMinutes);
  }

  // Reset seconds and milliseconds to 0
  date.setSeconds(0);
  date.setMilliseconds(0);

  return date.toISOString();
}

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
    updated_at: roundToQuarterHour(station.dateTime),
  }));
}
