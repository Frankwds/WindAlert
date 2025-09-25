export interface StationData {
  id: string;
  station_id: string;
  wind_speed: number;
  wind_gust: number | null;
  wind_min_speed: number | null;
  direction: number;
  temperature?: number;
  updated_at: string;
}