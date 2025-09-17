import { supabase } from './client';
import { StationData, WeatherStationMarkerData } from './types';

export class StationDataService {

  /**
   * Insert new station data
   */
  static async insert(data: Omit<StationData, 'id'>): Promise<StationData> {
    const { data: result, error } = await supabase
      .from('station_data')
      .insert(data)
      .select()
      .single();

    if (error) {
      console.error('Error inserting station data:', error);
      throw error;
    }

    return result;
  }

  /**
   * Insert multiple station data records
   */
  static async insertMany(dataArray: Omit<StationData, 'id'>[]): Promise<StationData[]> {
    const { data, error } = await supabase
      .from('station_data')
      .insert(dataArray)
      .select();

    if (error) {
      console.error('Error inserting multiple station data records:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get latest data for a specific station
   */
  static async getLatestByStationId(stationId: number): Promise<StationData | null> {
    const { data, error } = await supabase
      .from('station_data')
      .select('*')
      .eq('station_id', stationId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching latest station data:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get historical data for a specific station within a time range
   */
  static async getHistoricalData(
    stationId: number,
    hoursBack: number = 24
  ): Promise<StationData[]> {
    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('station_data')
      .select('*')
      .eq('station_id', stationId)
      .gte('updated_at', startTime)
      .order('updated_at', { ascending: true });

    if (error) {
      console.error('Error fetching historical station data:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get latest data for all stations
   */
  static async getLatestForAllStations(): Promise<StationData[]> {
    const { data, error } = await supabase
      .from('station_data')
      .select(`
        *,
        station_id
      `)
      .order('station_id, updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching latest data for all stations:', error);
      throw error;
    }

    if (!data) return [];

    // Group by station_id and get the latest record for each
    const latestByStation = new Map<number, StationData>();
    data.forEach(record => {
      const stationId = record.station_id;
      if (!latestByStation.has(stationId) ||
        new Date(record.updated_at) > new Date(latestByStation.get(stationId)!.updated_at)) {
        latestByStation.set(stationId, record);
      }
    });

    return Array.from(latestByStation.values());
  }

  /**
   * Get data for multiple stations within a time range
   */
  static async getDataForStations(
    stationIds: number[],
    hoursBack: number = 24
  ): Promise<StationData[]> {
    const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('station_data')
      .select('*')
      .in('station_id', stationIds)
      .gte('updated_at', startTime)
      .order('station_id, updated_at', { ascending: true });

    if (error) {
      console.error('Error fetching data for multiple stations:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Delete old data
   */
  static async deleteOldData(daysToKeep: number = 3): Promise<number> {
    const cutoffDate = new Date(Date.now() - daysToKeep * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('station_data')
      .delete()
      .lt('updated_at', cutoffDate)
      .select('id');

    if (error) {
      console.error('Error deleting old station data:', error);
      throw error;
    }

    return data?.length || 0;
  }
}