import { useCallback, useEffect } from 'react';
import { useMapInstance } from './map/useMapInstance';
import { useMarkers } from './markers/useMarkers';

interface UseContributeMapProps {
  latitude: number;
  longitude: number;
  landingLatitude?: number;
  landingLongitude?: number;
  onLandingChange?: (lat: number, lng: number) => void;
}

export const useContributeMap = ({
  latitude,
  longitude,
  landingLatitude,
  landingLongitude,
  onLandingChange,
}: UseContributeMapProps) => {
  const { mapRef, mapInstance, isLoading, error } = useMapInstance({
    latitude,
    longitude,
    onMapReady: useCallback(() => {
      // Map is ready, markers will be initialized by useContributeMarkers
    }, []),
  });

  const { addLandingMarker } = useMarkers({
    mapInstance,
    latitude,
    longitude,
    landingLatitude,
    landingLongitude,
    onLandingChange,
  });

  // Update the map click handler to use addLandingMarker
  useEffect(() => {
    if (mapInstance && addLandingMarker) {
      const clickListener = mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          const lat = event.latLng.lat();
          const lng = event.latLng.lng();
          addLandingMarker(lat, lng);
        }
      });

      return () => {
        google.maps.event.removeListener(clickListener);
      };
    }
  }, [mapInstance, addLandingMarker]);

  return {
    mapRef,
    mapInstance,
    isLoading,
    error,
  };
};
