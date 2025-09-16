import { useState, useCallback, useEffect } from 'react';
import { createAllMarkers } from '../../MarkerSetup';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';
import { useDataLoading } from '../data/useDataLoading';

type DataSource = 'main' | 'all';

interface UseMarkersProps {
  mapInstance: google.maps.Map | null;
  onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData | WeatherStationMarkerData) => void;
  dataSource?: DataSource;
}

export const useMarkers = ({ mapInstance, onMarkerClick, dataSource = 'main' }: UseMarkersProps) => {
  const [paraglidingMarkers, setParaglidingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const { loadAllData, isDataLoading, dataLoadingError } = useDataLoading({ dataSource });

  const loadAllMarkers = useCallback(async () => {
    if (isLoadingMarkers) return;

    try {
      setIsLoadingMarkers(true);
      setMarkersError(null);

      const { paraglidingLocations, weatherStations } = await loadAllData();

      const { paraglidingMarkers, weatherStationMarkers } = createAllMarkers({
        paraglidingLocations,
        weatherStations,
        onMarkerClick
      });

      setParaglidingMarkers(paraglidingMarkers);
      setWeatherStationMarkers(weatherStationMarkers);
    } catch (err) {
      console.error('Error loading all markers:', err);
      setMarkersError(err instanceof Error ? err.message : 'Failed to load markers');
    } finally {
      setIsLoadingMarkers(false);
    }
  }, [onMarkerClick, isLoadingMarkers, loadAllData]);

  useEffect(() => {
    if (mapInstance && !isLoadingMarkers && paraglidingMarkers.length === 0 && weatherStationMarkers.length === 0) {
      loadAllMarkers();
    }
  }, [mapInstance, isLoadingMarkers, paraglidingMarkers.length, weatherStationMarkers.length, loadAllMarkers]);

  return {
    paraglidingMarkers,
    weatherStationMarkers,
    loadAllMarkers,
    isLoadingMarkers: isLoadingMarkers || isDataLoading,
    markersError: markersError || dataLoadingError,
  };
};
