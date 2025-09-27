import { getMapState, MapState, updateMapState } from '@/lib/localstorage/mapStorage';
import { useCallback, useState } from 'react';

const TTL_MINUTES = 30; // 30 minutes TTL for selected filters

const getInitialState = (): MapState | null => {
  if (typeof window !== 'undefined') {
    const parsedState = getMapState();

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
      updateMapState(clearedState);
      return clearedState;
    }

    return parsedState;
  }
  return null;
};

export const useMapState = () => {
  const [mapState, setMapState] = useState<MapState>(() => getInitialState() || getMapState());

  const saveState = useCallback((newState: Partial<MapState>) => {
    setMapState((prevState: MapState) => {
      const updatedState = {
        ...prevState,
        ...newState,
        timestamp: Date.now() // Always update timestamp when saving
      };
      updateMapState(updatedState);
      return updatedState;
    });
  }, []);

  const updateMapPosition = useCallback((center: { lat: number; lng: number }, zoom: number) => {
    saveState({ center, zoom });
  }, [saveState]);

  const updateFilters = useCallback((filters: Partial<Pick<MapState, 'showParaglidingMarkers' | 'showWeatherStationMarkers' | 'selectedWindDirections' | 'windFilterAndOperator' | 'promisingFilter' | 'showSkywaysLayer' | 'mapType'>>) => {
    saveState(filters);
  }, [saveState]);

  const updateMapType = useCallback((mapType: 'terrain' | 'satellite' | 'osm') => {
    saveState({ mapType });
  }, [saveState]);

  return {
    mapState,
    updateMapPosition,
    updateFilters,
    updateMapType,
    saveState
  };
};

export { getInitialState };
