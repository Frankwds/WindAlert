export interface StationData {
  id: string;
  station_id: string;
  wind_speed: number;
  wind_gust: number;
  wind_min_speed: number;
  direction: number;
  temperature?: number;
  updated_at: string;
}