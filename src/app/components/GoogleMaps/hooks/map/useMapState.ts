import { useCallback, useState } from 'react';
import { z } from 'zod';

const MAP_STATE_KEY = 'windlordMapState';
const TTL_MINUTES = 30; // 30 minutes TTL for selected filters

// Zod schema for MapState validation
const MapStateSchema = z.object({
  center: z.object({
    lat: z.number(),
    lng: z.number(),
  }),
  zoom: z.number(),
  showParaglidingMarkers: z.boolean(),
  showWeatherStationMarkers: z.boolean(),
  selectedWindDirections: z.array(z.string()),
  windFilterAndOperator: z.boolean(),
  promisingFilter: z.object({
    selectedDay: z.number(),
    selectedTimeRange: z.tuple([z.number(), z.number()]),
    minPromisingHours: z.number(),
  }).nullable(),
  showSkywaysLayer: z.boolean(),
  timestamp: z.number(),
});

// TypeScript type derived from Zod schema
type MapState = z.infer<typeof MapStateSchema>;

const getInitialState = (): MapState | null => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem(MAP_STATE_KEY);
    if (savedState) {
      try {
        const rawData = JSON.parse(savedState);
        const parsedState = MapStateSchema.parse(rawData);

        // Check if TTL has expired for wind-related filters
        const now = Date.now();
        const stateTimestamp = parsedState.timestamp;
        const ttlMs = TTL_MINUTES * 60 * 1000;

        if (now - stateTimestamp > ttlMs) {
          // TTL expired - clear selected filters but keep other settings
          const clearedState: MapState = {
            ...parsedState,
            selectedWindDirections: [],
            promisingFilter: null,
            timestamp: now
          };

          // Save the cleared state back to localStorage to avoid infinite loops
          localStorage.setItem(MAP_STATE_KEY, JSON.stringify(clearedState));
          return clearedState;
        }

        return parsedState;
      } catch (e) {
        console.error(`Could not parse or validate map state from local storage. Removing ${MAP_STATE_KEY}.`, e);
        localStorage.removeItem(MAP_STATE_KEY);
        return null;
      }
    }
  }
  return null;
};

const DEFAULT_STATE: MapState = {
  center: { lat: 65, lng: 8.5 },
  zoom: 5,
  showParaglidingMarkers: true,
  showWeatherStationMarkers: false,
  selectedWindDirections: [],
  windFilterAndOperator: true,
  promisingFilter: null,
  showSkywaysLayer: false,
  timestamp: Date.now()
};

export const useMapState = () => {
  const [mapState, setMapState] = useState<MapState>(() => getInitialState() || DEFAULT_STATE);

  const saveState = useCallback((newState: Partial<MapState>) => {
    setMapState(prevState => {
      const updatedState = {
        ...prevState,
        ...newState,
        timestamp: Date.now() // Always update timestamp when saving
      };
      localStorage.setItem(MAP_STATE_KEY, JSON.stringify(updatedState));
      return updatedState;
    });
  }, []);

  const updateMapPosition = useCallback((center: { lat: number; lng: number }, zoom: number) => {
    saveState({ center, zoom });
  }, [saveState]);

  const updateFilters = useCallback((filters: Partial<Pick<MapState, 'showParaglidingMarkers' | 'showWeatherStationMarkers' | 'selectedWindDirections' | 'windFilterAndOperator' | 'promisingFilter' | 'showSkywaysLayer'>>) => {
    saveState(filters);
  }, [saveState]);

  return {
    mapState,
    updateMapPosition,
    updateFilters,
    saveState
  };
};

export { getInitialState, MAP_STATE_KEY };
