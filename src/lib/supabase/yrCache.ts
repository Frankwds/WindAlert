import { supabase } from './client';
import { YrCache } from './types';

export class YrCacheService {
  static async get(locationId: string): Promise<YrCache | null> {
    const { data, error } = await supabase
      .from('yr_cache')
      .select('*')
      .eq('location_id', locationId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: "exact one row expected"
      console.error('Error fetching yr cache data:', error);
      return null;
    }

    return data;
  }

  static async upsert(cacheData: YrCache): Promise<void> {
    const { error } = await supabase
      .from('yr_cache')
      .upsert(cacheData, { onConflict: 'location_id' });

    if (error) {
      console.error('Error upserting yr cache data:', error);
      throw error;
    }
  }
}
