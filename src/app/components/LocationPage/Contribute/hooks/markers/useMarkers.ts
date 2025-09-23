import { createLandingMarkerElement, createParaglidingMarkerElement, createParaglidingMarkerElementWithDirection } from '@/app/components/shared/Markers';
import { useCallback, useEffect, useRef, useState } from 'react';

interface UseMarkersProps {
  mapInstance: google.maps.Map | null;
  latitude: number;
  longitude: number;
  landingLatitude?: number;
  landingLongitude?: number;
  onLandingChange?: (lat: number, lng: number) => void;
}

export const useMarkers = ({
  mapInstance,
  latitude,
  longitude,
  landingLatitude,
  landingLongitude,
  onLandingChange
}: UseMarkersProps) => {
  const onLandingChangeRef = useRef(onLandingChange);
  const [landingMarker, setLandingMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null); // We use the ref

  // Update ref when callback changes
  useEffect(() => {
    onLandingChangeRef.current = onLandingChange;
  }, [onLandingChange]);

  const createTakeoffMarker = useCallback((map: google.maps.Map) => {
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat: latitude, lng: longitude },
      title: 'Takeoff Location'
    });

    // Create red pin element
    const markerElement = createParaglidingMarkerElement();
    marker.content = markerElement;
    return marker;
  }, [latitude, longitude]);

  const createLandingMarker = useCallback((map: google.maps.Map, lat: number, lng: number) => {
    const marker = new google.maps.marker.AdvancedMarkerElement({
      map,
      position: { lat, lng },
      title: 'Landing Location',
      gmpDraggable: true
    });

    // Create green pin element
    const pinElement = createLandingMarkerElement();

    marker.content = pinElement;
    return marker;
  }, []);

  const addLandingMarker = useCallback((lat: number, lng: number) => {
    const map = mapInstance;
    if (!map) return;

    // Remove existing landing marker
    setLandingMarker(prev => {
      if (prev) {
        prev.map = null;
      }
      return null;
    });

    const newLandingMarker = createLandingMarker(map, lat, lng);
    setLandingMarker(newLandingMarker);
    onLandingChangeRef.current?.(lat, lng);

    // Add drag listener
    newLandingMarker.addListener('dragend', () => {
      const position = newLandingMarker.position;
      if (position) {
        // position is a LatLngLiteral with lat/lng as numbers, not functions
        const lat = typeof position.lat === 'function' ? position.lat() : position.lat;
        const lng = typeof position.lng === 'function' ? position.lng() : position.lng;
        onLandingChangeRef.current?.(lat, lng);
      }
    });
  }, [mapInstance, createLandingMarker]);

  // Initialize takeoff marker when map is ready
  useEffect(() => {
    if (!mapInstance) return;

    createTakeoffMarker(mapInstance);

    // Clear existing landing marker first
    setLandingMarker(prev => {
      if (prev) {
        prev.map = null;
      }
      return null;
    });

    // Create landing marker if coordinates exist
    if (landingLatitude && landingLongitude) {
      const landingMarker = createLandingMarker(mapInstance, landingLatitude, landingLongitude);
      setLandingMarker(landingMarker);

      // Add drag listener
      landingMarker.addListener('dragend', () => {
        const position = landingMarker.position;
        if (position) {
          // position is a LatLngLiteral with lat/lng as numbers, not functions
          const lat = typeof position.lat === 'function' ? position.lat() : position.lat;
          const lng = typeof position.lng === 'function' ? position.lng() : position.lng;
          onLandingChangeRef.current?.(lat, lng);
        }
      });
    }
  }, [mapInstance, createTakeoffMarker, createLandingMarker, landingLatitude, landingLongitude]);

  return {
    addLandingMarker
  };
};
