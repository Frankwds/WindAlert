export interface ChangelogLanding {
  id: string;
  location_id: string;
  flightlog_id: string;
  user_id: string;
  previous_landing_latitude: number | null;
  previous_landing_longitude: number | null;
  previous_landing_altitude: number | null;
  new_landing_latitude: number | null;
  new_landing_longitude: number | null;
  new_landing_altitude: number | null;
  created_at: string;
}

