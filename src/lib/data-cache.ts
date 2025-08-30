import { ParaglidingMarkerData, WeatherStationMarkerData } from './supabase/types';

interface Cache<T> {
  data: T | null;
  timestamp: number | null;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

class DataCache {
  private paraglidingLocations: Cache<ParaglidingMarkerData[]> = { data: null, timestamp: null };
  private weatherStations: Cache<WeatherStationMarkerData[]> = { data: null, timestamp: null };

  private isCacheValid(timestamp: number | null): boolean {
    if (!timestamp) {
      return false;
    }
    return (Date.now() - timestamp) < CACHE_DURATION;
  }

  getParaglidingLocations(): ParaglidingMarkerData[] | null {
    if (this.isCacheValid(this.paraglidingLocations.timestamp)) {
      return this.paraglidingLocations.data;
    }
    return null;
  }

  setParaglidingLocations(data: ParaglidingMarkerData[]) {
    this.paraglidingLocations = {
      data,
      timestamp: Date.now(),
    };
  }

  getWeatherStations(): WeatherStationMarkerData[] | null {
    if (this.isCacheValid(this.weatherStations.timestamp)) {
      return this.weatherStations.data;
    }
    return null;
  }

  setWeatherStations(data: WeatherStationMarkerData[]) {
    this.weatherStations = {
      data,
      timestamp: Date.now(),
    };
  }
}

export const dataCache = new DataCache();
