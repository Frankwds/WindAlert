import { ParaglidingMarkerData, WeatherStationMarkerData } from './supabase/types';

interface Cache<T> {
  data: T | null;
  timestamp: number | null;
}

const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
const DB_NAME = 'WindLordCache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

class DataCache {
  private readonly PARAGLIDING_KEY = 'windlord_cache_paragliding';
  private readonly WEATHER_KEY = 'windlord_cache_weatherstation';
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

  private isCacheValid(timestamp: number | null): boolean {
    if (!timestamp) {
      return false;
    }
    return (Date.now() - timestamp) < CACHE_DURATION;
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

  async getParaglidingLocations(): Promise<ParaglidingMarkerData[] | null> {
    const cached = await this.getFromStorage(this.PARAGLIDING_KEY);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  async setParaglidingLocations(data: ParaglidingMarkerData[]): Promise<void> {
    await this.setToStorage(this.PARAGLIDING_KEY, data);
  }

  async getWeatherStations(): Promise<WeatherStationMarkerData[] | null> {
    const cached = await this.getFromStorage(this.WEATHER_KEY);
    if (cached && this.isCacheValid(cached.timestamp)) {
      return cached.data;
    }
    return null;
  }

  async setWeatherStations(data: WeatherStationMarkerData[]): Promise<void> {
    await this.setToStorage(this.WEATHER_KEY, data);
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

        let completed = 0;
        const onComplete = () => {
          completed++;
          if (completed === 2) {
            resolve();
          }
        };

        deleteParagliding.onsuccess = onComplete;
        deleteParagliding.onerror = () => reject(deleteParagliding.error);
        deleteWeather.onsuccess = onComplete;
        deleteWeather.onerror = () => reject(deleteWeather.error);
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
      return paraglidingCached !== null || weatherCached !== null;
    } catch (error) {
      console.warn('Failed to check cache status:', error);
      return false;
    }
  }
}

export const dataCache = new DataCache();
