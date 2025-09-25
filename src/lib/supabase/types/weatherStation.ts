export interface WeatherStation {
  id: string;
  station_id: number;
  name: string;
  longitude: number;
  latitude: number;
  altitude: number;
  country: string | null;
  is_active: boolean;
  provider: string;
  updated_at: string;
}

