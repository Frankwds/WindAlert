import { useCallback, useState } from 'react';

const MAP_STATE_KEY = 'windlordMapState';

interface MapState {
  center: { lat: number; lng: number };
  zoom: number;
  showParaglidingMarkers: boolean;
  showWeatherStationMarkers: boolean;
  selectedWindDirections: string[];
  windFilterAndOperator: boolean;
  promisingFilter: {
    selectedDay: number;
    selectedTimeRange: [number, number];
    minPromisingHours: number;
  } | null;
  showSkywaysLayer: boolean;
}

const getInitialState = (): MapState | null => {
  if (typeof window !== 'undefined') {
    const savedState = localStorage.getItem(MAP_STATE_KEY);
    if (savedState) {
      try {
        const parsedState = JSON.parse(savedState);
        // Basic validation
        if (parsedState.center && typeof parsedState.zoom === 'number') {
          return parsedState;
        }
      } catch (e) {
        console.error('Could not parse map state from local storage', e);
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
  showSkywaysLayer: false
};

export const useMapState = () => {
  const [mapState, setMapState] = useState<MapState>(() => getInitialState() || DEFAULT_STATE);

  const saveState = useCallback((newState: Partial<MapState>) => {
    setMapState(prevState => {
      const updatedState = { ...prevState, ...newState };
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
