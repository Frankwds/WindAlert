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
   * Upsert multiple station data records
   * Conflicts on station_id and updated_at to ensure only latest data is kept
   */
  static async upsertManyStationData(dataArray: Omit<StationData, 'id'>[]): Promise<StationData[]> {
    if (dataArray.length === 0) return [];

    const { data, error } = await supabaseServer
      .from('station_data')
      .upsert(dataArray, {
        onConflict: 'station_id,updated_at',
        ignoreDuplicates: true
      })
      .select();

    if (error) {
      console.error('Error upserting multiple station data records:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Refresh the latest station data materialized view
   * Call this after upserting station data to keep the view up to date
   */
  static async refreshLatestStationData(): Promise<void> {
    const { error } = await supabaseServer.rpc('refresh_latest_station_data');

    if (error) {
      console.error('Error refreshing latest station data materialized view:', error);
      throw error;
    }
  }

  /**
   * Delete station data older than 24 hours from now.
   */
  static async deleteAllOlderThanTwentyFourHours(): Promise<{ deleted_records: number }> {
    // Use UTC time to match the database timestamps
    const cutoffDate = new Date();
    cutoffDate.setUTCHours(cutoffDate.getUTCHours() - 24);

    const { data, error } = await supabaseServer
      .from('station_data')
      .delete()
      .lt('updated_at', cutoffDate.toISOString())
      .select('id');

    if (error) {
      console.error('Error deleting old station data:', error);
      throw error;
    }

    return { deleted_records: data?.length || 0 };
  }
  // RETURNS TABLE(
  //   original_records INTEGER,
  //   compressed_records INTEGER,
  //   stations_processed INTEGER
  // )
  static async compressOldStationData(): Promise<{
    original_records: number, compressed_records: number, stations_processed: number
  }> {
    const hourOffset = 4;
    const { data, error } = await supabaseServer.rpc('compress_old_station_data', {
      hours_old: hourOffset
    });

    if (error) {
      console.error('Error compressing data:', error);
      throw error;
    }

    return data && data.length > 0 ?
      data[0] : { original_records: 0, compressed_records: 0, stations_processed: 0 }
  }
}