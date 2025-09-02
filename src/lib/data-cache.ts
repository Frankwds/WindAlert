import { ParaglidingMarkerData, WeatherStationMarkerData } from './supabase/types';

interface Cache<T> {
  data: T | null;
  timestamp: number | null;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

class DataCache {
  private readonly PARAGLIDING_KEY = 'windlord_cache_paragliding';
  private readonly WEATHER_KEY = 'windlord_cache_weather';

  private isCacheValid(timestamp: number | null): boolean {
    if (!timestamp) {
      return false;
    }
    return (Date.now() - timestamp) < CACHE_DURATION;
  }

  private getFromStorage(key: string): Cache<any> | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const stored = sessionStorage.getItem(key);
      if (!stored) {
        return null;
      }
      return JSON.parse(stored);
    } catch (error) {
      console.warn(`Failed to parse cache data for key ${key}:`, error);
      sessionStorage.removeItem(key);
      return null;
    }
  }

  private setToStorage(key: string, data: any): void {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const cacheData: Cache<any> = {
        data,
        timestamp: Date.now(),
      };
      sessionStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.warn(`Failed to store cache data for key ${key}:`, error);
    }
  }

  getParaglidingLocations(): ParaglidingMarkerData[] | null {
    const cached = this.getFromStorage(this.PARAGLIDING_KEY);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  setParaglidingLocations(data: ParaglidingMarkerData[]): void {
    this.setToStorage(this.PARAGLIDING_KEY, data);
  }

  getWeatherStations(): WeatherStationMarkerData[] | null {
    const cached = this.getFromStorage(this.WEATHER_KEY);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  setWeatherStations(data: WeatherStationMarkerData[]): void {
    this.setToStorage(this.WEATHER_KEY, data);
  }

  clearCache(): void {
    if (typeof window === 'undefined') {
      return;
    }
    sessionStorage.removeItem(this.PARAGLIDING_KEY);
    sessionStorage.removeItem(this.WEATHER_KEY);
  }

  hasCache(): boolean {
    if (typeof window === 'undefined') {
      return false;
    }
    return sessionStorage.getItem(this.PARAGLIDING_KEY) !== null ||
      sessionStorage.getItem(this.WEATHER_KEY) !== null;
  }
}

export const dataCache = new DataCache();
