export interface User {
  id: string;
  email: string;
  name: string | null;
  google_id: string | null;
  image_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface ParaglidingLocation {
  id: string;
  name: string;
  description: string | null;
  longitude: number;
  latitude: number;
  altitude: number;
  country: string;
  flightlog_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export type Database = {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<User, 'created_at' | 'updated_at'>>;
      };
      paragliding_locations: {
        Row: ParaglidingLocation;
        Insert: Omit<ParaglidingLocation, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<ParaglidingLocation, 'id' | 'created_at' | 'updated_at'>>;
      };
    };
  };
};
