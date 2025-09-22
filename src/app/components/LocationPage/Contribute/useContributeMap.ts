import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const MAP_CONFIG = {
  DEFAULT_ZOOM: 11,
  MAP_ID: 'WindLordContributeMapID'
} as const;

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
  onLandingChange
}: UseContributeMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const onLandingChangeRef = useRef(onLandingChange);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [landingMarker, setLandingMarker] = useState<google.maps.marker.AdvancedMarkerElement | null>(null);

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
    const pinElement = document.createElement('div');
    pinElement.style.width = '20px';
    pinElement.style.height = '20px';
    pinElement.style.backgroundColor = '#ef4444'; // red-500
    pinElement.style.borderRadius = '50% 50% 50% 0';
    pinElement.style.border = '2px solid white';
    pinElement.style.transform = 'rotate(-45deg)';
    pinElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';

    marker.content = pinElement;
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
    const pinElement = document.createElement('div');
    pinElement.style.width = '20px';
    pinElement.style.height = '20px';
    pinElement.style.backgroundColor = '#22c55e'; // green-500
    pinElement.style.borderRadius = '50% 50% 50% 0';
    pinElement.style.border = '2px solid white';
    pinElement.style.transform = 'rotate(-45deg)';
    pinElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
    pinElement.style.cursor = 'grab';

    marker.content = pinElement;
    return marker;
  }, []);


  // Initialize map
  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'GOOGLE_MAPS_API_KEY') {
          throw new Error('Google Maps API key is not configured');
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'marker']
        });

        const google = await loader.load();

        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: MAP_CONFIG.DEFAULT_ZOOM,
          mapTypeId: google.maps.MapTypeId.TERRAIN,
          mapId: MAP_CONFIG.MAP_ID,
          streetViewControl: false,
          disableDefaultUI: true,
          fullscreenControl: false,
          zoomControl: false,
          clickableIcons: false,
          scrollwheel: true
        });

        // Create takeoff marker
        createTakeoffMarker(map);

        // Create landing marker if coordinates exist
        if (landingLatitude && landingLongitude) {
          const landingMarker = createLandingMarker(map, landingLatitude, landingLongitude);
          setLandingMarker(landingMarker);
          // Add drag listener
          landingMarker.addListener('dragend', () => {
            const position = landingMarker.position as google.maps.LatLng;
            if (position) {
              onLandingChangeRef.current?.(position.lat(), position.lng());
            }
          });
        }

        // Add map click listener
        map.addListener('click', (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const lat = event.latLng.lat();
            const lng = event.latLng.lng();

            // Remove existing landing marker
            setLandingMarker(prev => {
              if (prev) {
                prev.map = null;
              }
              return null;
            });

            // Create new landing marker
            const newLandingMarker = createLandingMarker(map, lat, lng);
            setLandingMarker(newLandingMarker);
            onLandingChangeRef.current?.(lat, lng);

            // Add drag listener
            newLandingMarker.addListener('dragend', () => {
              const position = newLandingMarker.position as google.maps.LatLng;
              if (position) {
                onLandingChangeRef.current?.(position.lat(), position.lng());
              }
            });
          }
        });

        mapInstanceRef.current = map;
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing contribute map:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
  }, [latitude, longitude, createTakeoffMarker, createLandingMarker]);

  return {
    mapRef,
    mapInstance: mapInstanceRef.current,
    isLoading,
    error,
  };
};
