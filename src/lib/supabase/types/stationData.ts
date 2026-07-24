export interface StationData {
  station_id: string;
  wind_speed: number | null;
  wind_gust: number | null;
  direction: number | null;
  temperature: number | null;
  updated_at: string;
}
