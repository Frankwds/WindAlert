import { useState, useCallback, useEffect } from 'react';
import { createWeatherStationMarkers } from '../../MarkerSetup';
import { WeatherStationMarkerData } from '@/lib/supabase/types';
import { useWeatherStationData } from '../data/useWeatherStationData';

interface UseWeatherStationMarkersProps {
  mapInstance: google.maps.Map | null;
  onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: WeatherStationMarkerData) => void;
}

export const useWeatherStationMarkers = ({ mapInstance, onMarkerClick }: UseWeatherStationMarkersProps) => {
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const { loadWeatherStationData } = useWeatherStationData();

  const loadMarkers = useCallback(async () => {
    if (isLoadingMarkers) return; // Prevent multiple simultaneous loads

    try {
      setIsLoadingMarkers(true);
      setMarkersError(null);

      const weatherStations = await loadWeatherStationData();
      const markers = createWeatherStationMarkers(weatherStations, onMarkerClick);

      setWeatherStationMarkers(markers);
    } catch (err) {
      console.error('Error loading weather station markers:', err);
      setMarkersError(err instanceof Error ? err.message : 'Failed to load weather station markers');
    } finally {
      setIsLoadingMarkers(false);
    }
  }, [onMarkerClick, isLoadingMarkers, loadWeatherStationData]);

  useEffect(() => {
    if (mapInstance && !isLoadingMarkers && weatherStationMarkers.length === 0) {
      loadMarkers();
    }
  }, [mapInstance, isLoadingMarkers, weatherStationMarkers.length, loadMarkers]);

  return {
    weatherStationMarkers,
    loadMarkers,
    isLoadingMarkers,
    markersError
  };
};
