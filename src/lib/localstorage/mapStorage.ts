import { z } from 'zod';
import { WEATHER_CONDITIONS, type WeatherCondition } from '@/app/components/GoogleMaps/mapControls/PromisingFilter';

// Type definition
export type MapState = {
  center: {
    lat: number;
    lng: number;
  };
  zoom: number;
  mapType: 'terrain' | 'satellite' | 'osm';
  showParaglidingMarkers: boolean;
  showWeatherStationMarkers: boolean;
  showLandingsLayer: boolean;
  selectedWindDirections: string[];
  windFilterAndOperator: boolean;
  promisingFilter: {
    selectedDay: number;
    selectedTimeRange: [number, number];
    minPromisingHours: number;
    selectedWeatherConditions: WeatherCondition[];
  } | null;
  showSkywaysLayer: boolean;
  showThermalsLayer: boolean;
  isFullscreen: boolean;
  timestamp: number;
};

// Storage key for map state
const MAP_STATE_KEY = 'windlord_map_state';

// Zod schema for validation
const MapStateSchema = z.object({
  center: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  zoom: z.number(),
  mapType: z.enum(['terrain', 'satellite', 'osm']),
  showParaglidingMarkers: z.boolean(),
  showWeatherStationMarkers: z.boolean(),
  showLandingsLayer: z.boolean(),
  selectedWindDirections: z.array(z.string()),
  windFilterAndOperator: z.boolean(),
  promisingFilter: z.object({
    selectedDay: z.number(),
    selectedTimeRange: z.tuple([z.number(), z.number()]),
    minPromisingHours: z.number(),
    selectedWeatherConditions: z.array(z.enum(WEATHER_CONDITIONS)),
  }).nullable(),
  showSkywaysLayer: z.boolean(),
  showThermalsLayer: z.boolean(),
  isFullscreen: z.boolean(),
  timestamp: z.number(),
});

// Default value
const DEFAULT_MAP_STATE: MapState = {
  center: { lat: 65, lng: 8.5 },
  zoom: 5,
  mapType: 'terrain',
  showParaglidingMarkers: true,
  showWeatherStationMarkers: false,
  showLandingsLayer: false,
  selectedWindDirections: [],
  windFilterAndOperator: true,
  promisingFilter: null,
  showSkywaysLayer: false,
  showThermalsLayer: false,
  isFullscreen: false,
  timestamp: Date.now()
};

// Utility function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get localStorage item "${key}":`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set localStorage item "${key}":`, error);
    }
  },
  removeItem: (key: string): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(key);
    } catch (error) {
      console.warn(`Failed to remove localStorage item "${key}":`, error);
    }
  }
};

// Map state methods
export const getMapState = (): MapState => {
  const stored = safeLocalStorage.getItem(MAP_STATE_KEY);
  if (stored === null) return DEFAULT_MAP_STATE;

  try {
    const rawData = JSON.parse(stored);

    // Handle backward compatibility for selectedWeatherConditions
    if (rawData.promisingFilter && !rawData.promisingFilter.hasOwnProperty('selectedWeatherConditions')) {
      rawData.promisingFilter.selectedWeatherConditions = [];
    }

    const parsedState = MapStateSchema.parse(rawData);
    return parsedState;
  } catch (error) {
    console.warn('Failed to parse or validate map state from localStorage:', error);
    // Remove invalid data
    safeLocalStorage.removeItem(MAP_STATE_KEY);
    return DEFAULT_MAP_STATE;
  }
};

export const setMapState = (mapState: MapState): void => {
  try {
    MapStateSchema.parse(mapState);
    safeLocalStorage.setItem(MAP_STATE_KEY, JSON.stringify(mapState));
  } catch (error) {
    console.warn('Failed to validate map state before saving:', error);
  }
};

export const updateMapState = (updates: Partial<MapState>): void => {
  const currentState = getMapState();
  const updatedState = {
    ...currentState,
    ...updates,
    timestamp: Date.now()
  };
  setMapState(updatedState);
};

// Convenience methods for fullscreen state
export const getFullscreenState = (): boolean => {
  return getMapState().isFullscreen;
};

export const setFullscreenState = (isFullscreen: boolean): void => {
  updateMapState({ isFullscreen });
};
