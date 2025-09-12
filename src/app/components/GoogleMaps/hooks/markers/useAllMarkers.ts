import { useState, useEffect, useCallback } from 'react';
import { createAllMarkers } from '../../MarkerSetup';
import { useDataLoadingAll } from '../data/useDataLoadingAll';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';

interface UseAllMarkersProps {
  mapInstance: google.maps.Map | null;
  onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData) => void;
}

export const useAllMarkers = ({ mapInstance, onMarkerClick }: UseAllMarkersProps) => {
  const [paraglidingMarkers, setParaglidingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { loadAllParaglidingData } = useDataLoadingAll();

  const loadAllMarkers = useCallback(async () => {
    if (!mapInstance) return;

    try {
      setIsLoading(true);
      setError(null);

      // Load all paragliding locations (with caching, no TTL)
      const { paraglidingLocations: locations } = await loadAllParaglidingData();

      // Create a wrapper function that handles the type conversion
      const onMarkerClickWrapper = (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData | WeatherStationMarkerData) => {
        // Since we only have paragliding locations, we can safely cast
        if ('n' in location) {
          onMarkerClick(marker, location as ParaglidingMarkerData);
        }
      };

      // Create markers
      const markers = createAllMarkers({
        paraglidingLocations: locations,
        weatherStations: [], // No weather stations for all locations view
        onMarkerClick: onMarkerClickWrapper
      });

      setParaglidingMarkers(markers.paraglidingMarkers);
    } catch (err) {
      console.error('Error loading all markers:', err);
      setError(err instanceof Error ? err.message : 'Failed to load markers');
    } finally {
      setIsLoading(false);
    }
  }, [mapInstance, onMarkerClick, loadAllParaglidingData]);

  // Load markers when map instance is available
  useEffect(() => {
    if (mapInstance && paraglidingMarkers.length === 0) {
      loadAllMarkers();
    }
  }, [mapInstance, paraglidingMarkers.length]);

  return {
    paraglidingMarkers,
    isLoading,
    error,
    loadAllMarkers
  };
};
