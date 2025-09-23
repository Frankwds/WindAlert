import { useState, useCallback } from 'react';
import { createLandingMarker } from '../../MarkerSetup';
import { ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import { calculateDistance } from '@/lib/utils/calculateDistance';

interface UseLandingMarkerProps {
  mapInstance: google.maps.Map | null;
  onLandingMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => void;
}

export const useLandingMarker = ({ mapInstance, onLandingMarkerClick }: UseLandingMarkerProps) => {
  const [currentLandingMarker, setCurrentLandingMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);
  const [currentLandingLine, setCurrentLandingLine] = useState<google.maps.Polyline | null>(null);

  const clearLandingMarker = useCallback(() => {
    setCurrentLandingMarker(prev => {
      if (prev) {
        prev.map = null;
      }
      return null;
    });

    setCurrentLandingLine(prev => {
      if (prev) {
        prev.setMap(null);
      }
      return null;
    });
  }, []);

  const showLandingMarker = useCallback((location: ParaglidingLocationWithForecast, paraglidingPosition: { lat: number; lng: number }) => {
    if (!mapInstance || !location.landing_latitude || !location.landing_longitude) return;

    // Validate coordinates
    if (!paraglidingPosition.lat || !paraglidingPosition.lng ||
      !location.landing_latitude || !location.landing_longitude ||
      isNaN(paraglidingPosition.lat) || isNaN(paraglidingPosition.lng) ||
      isNaN(location.landing_latitude) || isNaN(location.landing_longitude)) {
      console.warn('Invalid coordinates for landing line:', {
        paraglidingPosition,
        landingPosition: { lat: location.landing_latitude, lng: location.landing_longitude }
      });
      return;
    }

    if (calculateDistance(paraglidingPosition.lat, paraglidingPosition.lng, location.landing_latitude, location.landing_longitude) > 5000) {
      console.warn('Distance between paragliding and landing is too great:', {
        paraglidingPosition,
        landingPosition: { lat: location.landing_latitude, lng: location.landing_longitude }
      });
      return;
    }

    const landingMarker = createLandingMarker(location);

    const markerElement = landingMarker.content as HTMLElement;
    markerElement.addEventListener('click', (event: Event) => {
      event.stopPropagation();
      onLandingMarkerClick(landingMarker, location);
    });

    landingMarker.map = mapInstance;
    setCurrentLandingMarker(landingMarker);


    const lineSymbol = {
      path: google.maps.SymbolPath.CIRCLE,
      scale: 8, // The size of the dot
      strokeColor: "#393",
    };

    // Create line between paragliding and landing markers
    const line = new google.maps.Polyline({
      path: [
        paraglidingPosition,
        { lat: location.landing_latitude, lng: location.landing_longitude }
      ],
      strokeColor: '#FF0000',
      strokeOpacity: 0,

      zIndex: 250,

      icons: [{
        icon: {
          path: 'M 0,-1 0,1',
          strokeOpacity: 0.8,
          strokeWeight: 2,
          strokeColor: '#FF0000'
        },

        repeat: '15px'
      }]
    });

    line.setMap(mapInstance);
    setCurrentLandingLine(line);
  }, [mapInstance, onLandingMarkerClick]);

  return {
    currentLandingMarker,
    clearLandingMarker,
    showLandingMarker
  };
};
