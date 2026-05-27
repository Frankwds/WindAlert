import { supabaseServer } from './serverClient';
import {
  ParaglidingLocation,
  ChangelogLanding,
  ChangelogIsMain,
} from './types';

export class Server {
  /**
   * Get a paragliding location by ID
   */
  static async getLocationById(locationId: string): Promise<ParaglidingLocation | null> {
    const { data, error } = await supabaseServer
      .from('all_paragliding_locations')
      .select('*')
      .eq('id', locationId)
      .single();

    if (error) {
      console.error(`Error fetching location with id ${locationId}:`, error);
      return null;
    }

    return data;
  }

  /**
   * Insert a landing changelog record
   */
  static async insertLandingChangelog(
    changelog: Omit<ChangelogLanding, 'id' | 'created_at'>
  ): Promise<ChangelogLanding | null> {
    const { data, error } = await supabaseServer.from('changelog_landings').insert(changelog).select('*').single();

    if (error) {
      console.error('Error inserting landing changelog:', error);
      return null;
    }

    return data;
  }

  /**
   * Insert an is_main changelog record
   */
  static async insertIsMainChangelog(
    changelog: Omit<ChangelogIsMain, 'id' | 'created_at'>
  ): Promise<ChangelogIsMain | null> {
    const { data, error } = await supabaseServer.from('changelog_is_main').insert(changelog).select('*').single();

    if (error) {
      console.error('Error inserting is_main changelog:', error);
      return null;
    }

    return data;
  }

  /**
   * Update landing coordinates for a paragliding location
   */
  static async updateLocationLanding(
    locationId: string,
    landingLatitude: number,
    landingLongitude: number,
    landingAltitude?: number | null
  ): Promise<ParaglidingLocation | null> {
    const updateData: Partial<ParaglidingLocation> = {
      landing_latitude: landingLatitude,
      landing_longitude: landingLongitude,
      updated_at: new Date().toISOString(),
    };

    // Only update altitude if it's provided (including 0)
    if (landingAltitude !== undefined && landingAltitude !== null) {
      updateData.landing_altitude = landingAltitude;
    }

    const { data, error } = await supabaseServer
      .from('all_paragliding_locations')
      .update(updateData)
      .eq('id', locationId)
      .select('*')
      .single();

    if (error) {
      console.error(`Error updating landing coordinates for location ${locationId}:`, error);
      return null;
    }

    return data;
  }

  /**
   * Update is_main status for a paragliding location
   */
  static async updateLocationIsMain(locationId: string, is_main: boolean): Promise<ParaglidingLocation | null> {
    const updateData: Partial<ParaglidingLocation> = {
      is_main,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabaseServer
      .from('all_paragliding_locations')
      .update(updateData)
      .eq('id', locationId)
      .select('*')
      .single();

    if (error) {
      console.error(`Error updating is_main for location ${locationId}:`, error);
      return null;
    }

    return data;
  }

  /**
   * Upsert a paragliding location by flightlog_id
   * Preserves existing landing coordinates and is_main flag by excluding them from the upsert
   */
  static async upsertParaglidingLocation(
    location: Omit<
      ParaglidingLocation,
      'id' | 'created_at' | 'updated_at' | 'landing_latitude' | 'landing_longitude' | 'landing_altitude' | 'is_main'
    >
  ): Promise<ParaglidingLocation> {
    const { data, error } = await supabaseServer
      .from('all_paragliding_locations')
      .upsert(location, {
        onConflict: 'flightlog_id',
        ignoreDuplicates: false,
      })
      .select('*')
      .single();

    if (error) {
      console.error('Error upserting paragliding location:', error);
      throw error;
    }

    return data;
  }
}
