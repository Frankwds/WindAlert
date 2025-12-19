import { ParaglidingLocationWithForecast } from './supabase/types';

interface Cache<T> {
  data: T | null;
  timestamp: number | null;
}

const CACHE_DURATION_PARAGLIDING_WITH_FORECAST = 30 * 60 * 1000; // 30 minutes
const CACHE_DURATION_ALL_PARAGLIDING = 60 * 60 * 1000; // 1 day

const DB_NAME = 'WindLordCache';
const DB_VERSION = 1;
const STORE_NAME = 'cache';

// Hardcoded datetime for all paragliding locations cache invalidation
const ALL_PARAGLIDING_MIN_DATETIME = '2025-09-27T16:00:00.000Z';
const ALL_PARAGLIDING_MIN_TIMESTAMP = new Date(ALL_PARAGLIDING_MIN_DATETIME).getTime();

class DataCache {
  private readonly PARAGLIDING_KEY = 'windlord_cache_paragliding';
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

      request.onupgradeneeded = event => {
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
    return Date.now() - timestamp < cacheDuration;
  }

  private async getFromStorage(key: string): Promise<Cache<any> | null> {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const db = await this.initDB();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);

      return new Promise(resolve => {
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
              timestamp: result.timestamp,
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

  private async setToStorage(key: string, data: any, timestamp: number): Promise<void> {
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
        timestamp,
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
    await this.setToStorage(this.PARAGLIDING_KEY, data, Date.now());
  }

  async getAllParaglidingLocations(): Promise<ParaglidingLocationWithForecast[] | null> {
    const cached = await this.getFromStorage(this.ALL_PARAGLIDING_KEY);

    // Check if cache exists and is newer than the hardcoded minimum timestamp
    if (cached && this.isCacheValid(cached.timestamp, CACHE_DURATION_ALL_PARAGLIDING)) {
      return cached.data;
    }

    // Cache is either missing, invalid, or older than the minimum timestamp
    return null;
  }

  async setAllParaglidingLocations(data: ParaglidingLocationWithForecast[]): Promise<void> {
    await this.setToStorage(this.ALL_PARAGLIDING_KEY, data, Date.now());
  }

  async updateParaglidingLocationById(
    locationId: string,
    updates: Partial<ParaglidingLocationWithForecast>
  ): Promise<void> {
    // Update in the main paragliding locations cache
    const cached = await this.getFromStorage(this.PARAGLIDING_KEY);
    if (cached && cached.data) {
      const updatedData = cached.data.map((location: ParaglidingLocationWithForecast) =>
        location.id === locationId ? { ...location, ...updates } : location
      );
      await this.setToStorage(this.PARAGLIDING_KEY, updatedData, cached.timestamp ?? Date.now());
    }

    // Update in the all paragliding locations cache
    const allCached = await this.getFromStorage(this.ALL_PARAGLIDING_KEY);
    if (allCached && allCached.data) {
      const updatedAllData = allCached.data.map((location: ParaglidingLocationWithForecast) =>
        location.id === locationId ? { ...location, ...updates } : location
      );
      await this.setToStorage(this.ALL_PARAGLIDING_KEY, updatedAllData, allCached.timestamp ?? Date.now());
    }
  }

  /**
   * Update location when is_main changes.
   * If is_main is true, add/update in main cache.
   * If is_main is false, remove from main cache.
   * Always update in all paragliding locations cache.
   */
  async updateLocationIsMain(location: ParaglidingLocationWithForecast): Promise<void> {
    const locationId = location.id;
    const isMain = location.is_main;

    // Handle main paragliding locations cache (PARAGLIDING_KEY)
    const cached = await this.getFromStorage(this.PARAGLIDING_KEY);
    if (cached && cached.data) {
      if (isMain) {
        // Add or update in main cache
        const existingIndex = cached.data.findIndex((loc: ParaglidingLocationWithForecast) => loc.id === locationId);

        if (existingIndex >= 0) {
          // Update existing location
          const updatedData = [...cached.data];
          updatedData[existingIndex] = location;
          await this.setToStorage(this.PARAGLIDING_KEY, updatedData, cached.timestamp ?? Date.now());
        } else {
          // Add new location to main cache
          await this.setToStorage(this.PARAGLIDING_KEY, [...cached.data, location], cached.timestamp ?? Date.now());
        }
      } else {
        // Remove from main cache
        const filteredData = cached.data.filter((loc: ParaglidingLocationWithForecast) => loc.id !== locationId);
        await this.setToStorage(this.PARAGLIDING_KEY, filteredData, cached.timestamp ?? Date.now());
      }
    }

    // Also update in the all paragliding locations cache, in case we in the future need the property to not be stale.
    const allCached = await this.getFromStorage(this.ALL_PARAGLIDING_KEY);
    if (allCached && allCached.data) {
      const updatedAllData = allCached.data.map((loc: ParaglidingLocationWithForecast) =>
        loc.id === locationId ? location : loc
      );
      await this.setToStorage(this.ALL_PARAGLIDING_KEY, updatedAllData, allCached.timestamp ?? Date.now());
    }
  }

  /**
   * Add a new location to both caches, but only if the caches exist and have data.
   * If the location already exists (by id), it will be updated instead.
   */
  async addParaglidingLocationIfCacheExists(location: ParaglidingLocationWithForecast): Promise<void> {
    // Add/update in the main paragliding locations cache
    const cached = await this.getFromStorage(this.PARAGLIDING_KEY);
    if (cached && cached.data && Array.isArray(cached.data) && cached.data.length > 0) {
      const existingIndex = cached.data.findIndex((loc: ParaglidingLocationWithForecast) => loc.id === location.id);

      if (existingIndex >= 0) {
        // Update existing location
        const updatedData = [...cached.data];
        updatedData[existingIndex] = { ...updatedData[existingIndex], ...location };
        await this.setToStorage(this.PARAGLIDING_KEY, updatedData, cached.timestamp ?? Date.now());
      } else {
        // Add new location
        await this.setToStorage(this.PARAGLIDING_KEY, [...cached.data, location], cached.timestamp ?? Date.now());
      }
    }

    // Add/update in the all paragliding locations cache
    const allCached = await this.getFromStorage(this.ALL_PARAGLIDING_KEY);
    if (allCached && allCached.data && Array.isArray(allCached.data) && allCached.data.length > 0) {
      const existingIndex = allCached.data.findIndex((loc: ParaglidingLocationWithForecast) => loc.id === location.id);

      if (existingIndex >= 0) {
        // Update existing location
        const updatedAllData = [...allCached.data];
        updatedAllData[existingIndex] = { ...updatedAllData[existingIndex], ...location };
        await this.setToStorage(this.ALL_PARAGLIDING_KEY, updatedAllData, allCached.timestamp ?? Date.now());
      } else {
        // Add new location
        await this.setToStorage(
          this.ALL_PARAGLIDING_KEY,
          [...allCached.data, location],
          allCached.timestamp ?? Date.now()
        );
      }
    }
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
        const deleteAllParagliding = store.delete(this.ALL_PARAGLIDING_KEY);

        let completed = 0;
        const onComplete = () => {
          completed++;
          if (completed === 2) {
            resolve();
          }
        };

        deleteParagliding.onsuccess = onComplete;
        deleteParagliding.onerror = () => reject(deleteParagliding.error);
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
      const allParaglidingCached = await this.getFromStorage(this.ALL_PARAGLIDING_KEY);
      return paraglidingCached !== null || allParaglidingCached !== null;
    } catch (error) {
      console.warn('Failed to check cache status:', error);
      return false;
    }
  }
}

export const dataCache = new DataCache();
