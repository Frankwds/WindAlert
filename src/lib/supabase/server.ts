import { supabaseServer } from './serverClient';
import { ForecastCache1hr, ParaglidingLocation, StationData, WeatherStation } from './types';

export class Server {

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
      updated_at: new Date().toISOString()
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
 * Upsert multiple weather stations
 */
  static async upsertManyWeatherStation(stations: Omit<WeatherStation, 'id' | 'created_at' | 'updated_at'>[]): Promise<WeatherStation[]> {
    if (stations.length === 0) return [];

    const { data, error } = await supabaseServer
      .from('weather_stations')
      .upsert(stations, {
        onConflict: 'station_id',
        ignoreDuplicates: true
      })
      .select();

    if (error) {
      console.error('Error upserting weather stations:', error);
      throw error;
    }

    return data || [];
  }

  /**
 * Upsert forecast data (insert or update)
 * @param forecastData 
 */
  static async upsertForecastCache(forecastData: ForecastCache1hr[]): Promise<void> {
    const { error } = await supabaseServer
      .from('forecast_cache')
      .upsert(forecastData, { onConflict: 'time,location_id' });

    if (error) {
      console.error('Error upserting forecast data:', error);
      throw error;
    }
  }

  /**
   * Delete old forecast data before a specific time
   */
  static async deleteOldForecastCache(beforeTime: string): Promise<void> {
    const { error } = await supabaseServer
      .from('forecast_cache')
      .delete()
      .lt('time', beforeTime);

    if (error) {
      console.error('Error deleting old forecast data:', error);
      throw error;
    }
  }

  /**
   * Insert multiple station data records
   */
  static async insertManyStationData(dataArray: Omit<StationData, 'id'>[]): Promise<StationData[]> {
    const { data, error } = await supabaseServer
      .from('station_data')
      .insert(dataArray)
      .select();

    if (error) {
      console.error('Error inserting multiple station data records:', error);
      throw error;
    }

    return data || [];
  }
}