export interface Location {
  id: number;
  name: string;
  lat: number;
  long: number;
  elevation: number;
  timezone: string;
  description: string;
  windDirections: string[];
}
