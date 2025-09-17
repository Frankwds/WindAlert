import { useState, useEffect, useCallback } from 'react';
import { createAllMarkers } from '../../MarkerSetup';
import { useDataLoadingAll } from '../data/useDataLoadingAll';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';

interface UseAllMarkersProps {
  mapInstance: google.maps.Map | null;
  onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData | WeatherStationMarkerData) => void;
}

export const useAllMarkers = ({ mapInstance, onMarkerClick }: UseAllMarkersProps) => {
  const [paraglidingMarkers, setParaglidingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loadAllData } = useDataLoadingAll();

  const loadAllMarkers = useCallback(async () => {
    if (!mapInstance) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load all data (paragliding locations and weather stations)
      const { paraglidingLocations, weatherStations } = await loadAllData();

      // Create markers
      const markers = createAllMarkers({
        paraglidingLocations,
        weatherStations,
        onMarkerClick
      });

      setParaglidingMarkers(markers.paraglidingMarkers);
      setWeatherStationMarkers(markers.weatherStationMarkers);
    } catch (err) {
      console.error('Error loading all markers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load markers');
    } finally {
      setIsLoading(false);
    }
  }, [mapInstance, onMarkerClick, loadAllData]);

  // Load markers when map instance is available
  useEffect(() => {
    if (mapInstance && paraglidingMarkers.length === 0 && weatherStationMarkers.length === 0) {
      loadAllMarkers();
    }
  }, [mapInstance, paraglidingMarkers.length, weatherStationMarkers.length]);

  return {
    paraglidingMarkers,
    weatherStationMarkers,
    isLoading,
    error,
    loadAllMarkers
  };
};
