export interface WeatherStation {
  id: string;
  station_id: string;
  name: string;
  longitude: number;
  latitude: number;
  altitude: number;
  country: string | null;
  is_active: boolean;
  provider: string;
  updated_at: string;
  is_main: boolean;
}
