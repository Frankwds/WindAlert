import { useState, useCallback, useEffect } from 'react';
import { createAllMarkers } from '../../MarkerSetup';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { WeatherStationService } from '@/lib/supabase/weatherStations';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';
import { dataCache } from '@/lib/data-cache';

interface UseMarkersProps {
  mapInstance: google.maps.Map | null;
  onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData | WeatherStationMarkerData) => void;
}

export const useMarkers = ({ mapInstance, onMarkerClick }: UseMarkersProps) => {
  const [paraglidingMarkers, setParaglidingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [weatherStationMarkers, setWeatherStationMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [userLocationMarker, setUserLocationMarker] = useState<google.maps.Marker | null>(null);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const loadAllMarkers = useCallback(async () => {
    if (isLoadingMarkers) return; // Prevent multiple simultaneous loads

    try {
      setIsLoadingMarkers(true);
      setMarkersError(null);

      let paraglidingLocations = await dataCache.getParaglidingLocations();
      let weatherStations = await dataCache.getWeatherStations();

      if (!paraglidingLocations || !weatherStations) {
        const [fetchedParaglidingLocations, fetchedWeatherStations] = await Promise.all([
          ParaglidingLocationService.getAllActiveForMarkersWithForecast(),
          WeatherStationService.getNordicCountriesForMarkers()
        ]);

        paraglidingLocations = fetchedParaglidingLocations || [];
        weatherStations = fetchedWeatherStations || [];

        await Promise.all([
          dataCache.setParaglidingLocations(paraglidingLocations),
          dataCache.setWeatherStations(weatherStations)
        ]);
      }

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
  }, [onMarkerClick, isLoadingMarkers]);

  useEffect(() => {
    if (mapInstance && !isLoadingMarkers && paraglidingMarkers.length === 0 && weatherStationMarkers.length === 0) {
      loadAllMarkers();
    }
  }, [mapInstance, isLoadingMarkers, paraglidingMarkers.length, weatherStationMarkers.length]);

  return {
    paraglidingMarkers,
    weatherStationMarkers,
    userLocationMarker,
    setUserLocationMarker,
    loadAllMarkers,
    isLoadingMarkers,
    markersError
  };
};
