export interface ParaglidingLocation {
  id: string;
  name: string;
  description: string | null;
  longitude: number;
  latitude: number;
  altitude: number;
  country: string;
  flightlog_id: string;
  is_active: boolean;
  is_main: boolean;
  created_at: string;
  updated_at: string;
  n: boolean;
  e: boolean;
  s: boolean;
  w: boolean;
  ne: boolean;
  se: boolean;
  sw: boolean;
  nw: boolean;
  landing_latitude?: number;
  landing_longitude?: number;
  landing_altitude?: number;
}

export type MinimalParaglidingLocation = Pick<ParaglidingLocation,
  | 'id'
  | 'latitude'
  | 'longitude'
  | 'n'
  | 'e'
  | 's'
  | 'w'
  | 'ne'
  | 'se'
  | 'sw'
  | 'nw'
  | 'landing_latitude'
  | 'landing_longitude'
  | 'landing_altitude'
>;