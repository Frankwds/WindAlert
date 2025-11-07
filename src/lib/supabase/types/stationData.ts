export interface StationData {
  station_id: string;
  wind_speed: number;
  wind_gust: number | null;
  direction: number;
  temperature?: number;
  updated_at: string;
}
