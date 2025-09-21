export interface StationData {
  id: string;
  station_id: number;
  wind_speed: number;
  wind_gust: number;
  wind_min_speed: number;
  direction: number;
  temperature?: number;
  updated_at: string;
}