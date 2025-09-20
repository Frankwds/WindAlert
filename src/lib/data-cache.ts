import { ParaglidingLocationWithForecast, StationData, WeatherStationMarkerData } from './supabase/types';

interface Cache<T> {
  data: T | null;
  timestamp: number | null;
}

const CACHE_DURATION_PARAGLIDING_WITH_FORECAST = 30 * 60 * 1000; // 30 minutes
const CACHE_DURATION_ALL_PARAGLIDING = 14 * 24 * 60 * 60 * 1000; // 14 days
export const WEATHER_STATIONS_UPDATE_INTERVAL = 15 * 60 * 1000; // 15 minutes

const DB_NAME = 'WindLordCache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

// Hardcoded datetime for all paragliding locations cache invalidation
const ALL_PARAGLIDING_MIN_DATETIME = "2025-09-13T18:00:00.000Z";
const ALL_PARAGLIDING_MIN_TIMESTAMP = new Date(ALL_PARAGLIDING_MIN_DATETIME).getTime();

class DataCache {
  private readonly PARAGLIDING_KEY = 'windlord_cache_paragliding';
  private readonly WEATHER_KEY = 'windlord_cache_weatherstation';
  private readonly ALL_PARAGLIDING_KEY = 'windlord_cache_all_paragliding';
  private db: IDBDatabase | null = null;

  private async initDB(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    if (typeof window === 'undefined') {
      throw new Error('IndexedDB not available in server environment');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error('Failed to open IndexedDB'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'key' });
        }
      };
    });
  }

  private isCacheValid(timestamp: number | null, cacheDuration: number): boolean {
    if (!timestamp) {
      return false;
    }
    return (Date.now() - timestamp) < cacheDuration;
  }

  private async getFromStorage(key: string): Promise<Cache<any> | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const db = await this.initDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise((resolve, reject) => {
        const request = store.get(key);

        request.onerror = () => {
          console.warn(`Failed to get cache data for key ${key}:`, request.error);
          resolve(null);
        };

        request.onsuccess = () => {
          const result = request.result;
          if (result && result.data) {
            resolve({
              data: result.data,
              timestamp: result.timestamp
            });
          } else {
            resolve(null);
          }
        };
      });
    } catch (error) {
      console.warn(`Failed to access IndexedDB for key ${key}:`, error);
      return null;
    }
  }

  private async setToStorage(key: string, data: any): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const db = await this.initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      const cacheData = {
        key,
        data,
        timestamp: Date.now(),
      };

      await new Promise<void>((resolve, reject) => {
        const request = store.put(cacheData);

        request.onerror = () => {
          console.warn(`Failed to store cache data for key ${key}:`, request.error);
          reject(request.error);
        };

        request.onsuccess = () => {
          resolve();
        };
      });
    } catch (error) {
      console.warn(`Failed to store cache data for key ${key}:`, error);
    }
  }

  async getParaglidingLocations(): Promise<ParaglidingLocationWithForecast[] | null> {
    const cached = await this.getFromStorage(this.PARAGLIDING_KEY);
    if (cached && this.isCacheValid(cached.timestamp, CACHE_DURATION_PARAGLIDING_WITH_FORECAST)) {
      return cached.data;
    }
    return null;
  }

  async setParaglidingLocations(data: ParaglidingLocationWithForecast[]): Promise<void> {
    await this.setToStorage(this.PARAGLIDING_KEY, data);
  }

  async getWeatherStations(): Promise<WeatherStationMarkerData[] | null> {
    const cache = await this.getFromStorage(this.WEATHER_KEY);
    if (cache) {
      return cache.data;
    }
    return null;
  }


  async setWeatherStations(data: WeatherStationMarkerData[]): Promise<void> {
    await this.setToStorage(this.WEATHER_KEY, data);
  }

  async appendWeatherStationData(latestData: StationData[]): Promise<WeatherStationMarkerData[] | null> {

    // Get all stations for the update
    const allStations = await this.getWeatherStations();
    if (!allStations) {
      return null;
    }

    const updatedStations = allStations.map(station => {
      const latestForStation = latestData.find(data => data.station_id === station.station_id);
      if (latestForStation) {
        // Append new data point to existing station_data array
        return {
          ...station,
          station_data: [...station.station_data, latestForStation]
        };
      }
      return station;
    });

    await this.setToStorage(this.WEATHER_KEY, updatedStations);

    return updatedStations || null;
  }

  async getAllParaglidingLocations(): Promise<ParaglidingLocationWithForecast[] | null> {
    const cached = await this.getFromStorage(this.ALL_PARAGLIDING_KEY);

    // Check if cache exists and is newer than the hardcoded minimum timestamp
    if (cached && cached.data && cached.timestamp && cached.timestamp >= ALL_PARAGLIDING_MIN_TIMESTAMP
      && this.isCacheValid(cached.timestamp, CACHE_DURATION_ALL_PARAGLIDING)) {
      return cached.data;
    }

    // Cache is either missing, invalid, or older than the minimum timestamp
    return null;
  }

  async setAllParaglidingLocations(data: ParaglidingLocationWithForecast[]): Promise<void> {
    await this.setToStorage(this.ALL_PARAGLIDING_KEY, data);
  }

  async clearCache(): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      const db = await this.initDB();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);

      await new Promise<void>((resolve, reject) => {
        const deleteParagliding = store.delete(this.PARAGLIDING_KEY);
        const deleteWeather = store.delete(this.WEATHER_KEY);
        const deleteAllParagliding = store.delete(this.ALL_PARAGLIDING_KEY);

        let completed = 0;
        const onComplete = () => {
          completed++;
          if (completed === 3) {
            resolve();
          }
        };

        deleteParagliding.onsuccess = onComplete;
        deleteParagliding.onerror = () => reject(deleteParagliding.error);
        deleteWeather.onsuccess = onComplete;
        deleteWeather.onerror = () => reject(deleteWeather.error);
        deleteAllParagliding.onsuccess = onComplete;
        deleteAllParagliding.onerror = () => reject(deleteAllParagliding.error);
      });
    } catch (error) {
      console.warn('Failed to clear cache:', error);
    }
  }

  async hasCache(): Promise<boolean> {
    if (typeof window === 'undefined') {
      return false;
    }

    try {
      const paraglidingCached = await this.getFromStorage(this.PARAGLIDING_KEY);
      const weatherCached = await this.getFromStorage(this.WEATHER_KEY);
      const allParaglidingCached = await this.getFromStorage(this.ALL_PARAGLIDING_KEY);
      return paraglidingCached !== null || weatherCached !== null || allParaglidingCached !== null;
    } catch (error) {
      console.warn('Failed to check cache status:', error);
      return false;
    }
  }
}

export const dataCache = new DataCache();
