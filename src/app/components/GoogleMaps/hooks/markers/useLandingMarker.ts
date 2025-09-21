import { useState, useCallback } from 'react';
import { createLandingMarker } from '../../MarkerSetup';
import { ParaglidingLocationWithForecast } from '@/lib/supabase/types';

interface UseLandingMarkerProps {
  mapInstance: google.maps.Map | null;
  onLandingMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => void;
}

export const useLandingMarker = ({ mapInstance, onLandingMarkerClick }: UseLandingMarkerProps) => {
  const [currentLandingMarker, setCurrentLandingMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

  const clearLandingMarker = useCallback(() => {
    setCurrentLandingMarker(prev => {
      if (prev) {
        prev.map = null;
      }
      return null;
    });
  }, []);

  const showLandingMarker = useCallback((location: ParaglidingLocationWithForecast) => {
    if (!mapInstance || !location.landing_latitude || !location.landing_longitude) return;

    const landingMarker = createLandingMarker(location);

    const markerElement = landingMarker.content as HTMLElement;
    markerElement.addEventListener('click', (event: Event) => {
      event.stopPropagation();
      onLandingMarkerClick(landingMarker, location);
    });

    landingMarker.map = mapInstance;
    setCurrentLandingMarker(landingMarker);
  }, [mapInstance, onLandingMarkerClick]);

  return {
    currentLandingMarker,
    clearLandingMarker,
    showLandingMarker
  };
};
