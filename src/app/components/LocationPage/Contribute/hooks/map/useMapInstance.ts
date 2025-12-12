import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

const MAP_CONFIG = {
  DEFAULT_ZOOM: 13,
  MAP_ID: 'WindLordContributeMapID',
} as const;

interface UseMapInstanceProps {
  latitude: number;
  longitude: number;
  onMapReady: (map: google.maps.Map) => void;
}

export const useMapInstance = ({ latitude, longitude, onMapReady }: UseMapInstanceProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid dependency issues
  const onMapReadyRef = useRef(onMapReady);

  // Update refs when callbacks change
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

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

        // Set options for loading the API (only needs to be called once, but safe to call multiple times)
        setOptions({
          key: apiKey,
          v: 'weekly',
          libraries: ['places', 'marker', 'elevation'],
        });

        // Load the required libraries
        await importLibrary('maps');
        await importLibrary('places');
        await importLibrary('marker');
        await importLibrary('elevation');

        // Access google from the global namespace
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google;

        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: MAP_CONFIG.DEFAULT_ZOOM,
          mapTypeId: google.maps.MapTypeId.SATELLITE,
          mapId: MAP_CONFIG.MAP_ID,
          streetViewControl: false,
          disableDefaultUI: true,
          fullscreenControl: false,
          zoomControl: false,
          clickableIcons: false,
          scrollwheel: true,
          gestureHandling: 'greedy',
        });
        map.setOptions({ scaleControl: true });

        // Map click listener will be added by the parent hook

        mapInstanceRef.current = map;
        setMapInstance(map);
        setIsLoading(false);
        onMapReadyRef.current(map);
      } catch (err) {
        console.error('Error initializing contribute map:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
        setIsLoading(false);
      }
    };

    initMap();
  }, [latitude, longitude]);

  return {
    mapRef,
    mapInstance,
    isLoading,
    error,
  };
};
