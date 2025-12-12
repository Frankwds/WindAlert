import { useEffect, useRef, useState } from 'react';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { useThermalsLayer, useSkywaysLayer, useOSMMapType } from './useMapLayers';

const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 60.5, lng: 8.5 },
  DEFAULT_ZOOM: 5,
  MAP_ID: 'WindLordMapID',
} as const;

interface MapState {
  center?: { lat: number; lng: number };
  zoom?: number;
}

interface UseMapInstanceProps {
  initialMapState: MapState | null;
  onMapReady: (map: google.maps.Map) => void;
  onMapClick: () => void;
  showSkywaysLayer: boolean;
  showThermalsLayer: boolean;
  onMapPositionChange: (center: { lat: number; lng: number }, zoom: number) => void;
  initialMapType?: 'terrain' | 'satellite' | 'osm';
}

export const useMapInstance = ({
  initialMapState,
  onMapReady,
  onMapClick,
  showSkywaysLayer = false,
  showThermalsLayer = false,
  onMapPositionChange,
  initialMapType = 'terrain',
}: UseMapInstanceProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid dependency issues
  const onMapReadyRef = useRef(onMapReady);
  const onMapClickRef = useRef(onMapClick);

  // Layer hooks
  const { createThermalsLayer } = useThermalsLayer();
  const { createSkywaysLayer } = useSkywaysLayer();
  const { createOSMMapType } = useOSMMapType();

  // Update refs when callbacks change
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'GOOGLE_MAPS_API_KEY') {
          throw new Error(
            'Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.'
          );
        }

        // Set options for loading the API (only needs to be called once, but safe to call multiple times)
        setOptions({
          key: apiKey,
          version: 'weekly',
          libraries: ['places', 'marker'],
        });

        // Load the required libraries
        await importLibrary('maps');
        await importLibrary('places');
        await importLibrary('marker');

        // Access google from the global namespace
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const google = (window as any).google as typeof google;

        if (!mapRef.current) return;

        const mapTypeId =
          initialMapType === 'osm'
            ? 'osm'
            : initialMapType === 'satellite'
              ? google.maps.MapTypeId.HYBRID
              : google.maps.MapTypeId.TERRAIN;

        const map = new google.maps.Map(mapRef.current, {
          center: initialMapState?.center ?? MAP_CONFIG.DEFAULT_CENTER,
          zoom: initialMapState?.zoom ?? MAP_CONFIG.DEFAULT_ZOOM,
          mapTypeId,
          mapId: MAP_CONFIG.MAP_ID,
          streetViewControl: false,
          disableDefaultUI: true,
          fullscreenControl: false,
          zoomControl: false,
          clickableIcons: false,
          scrollwheel: true,
        });

        map.addListener('click', () => onMapClickRef.current());
        map.setOptions({ scaleControl: true });

        // Register OSM map type
        const osmMapType = createOSMMapType();
        map.mapTypes.set('osm', osmMapType);

        setMapInstance(map);
        setIsLoading(false);
        onMapReadyRef.current(map);

        // Add listeners for map position changes after map is fully initialized

        if (onMapPositionChange) {
          const savePosition = () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            if (center && zoom) {
              onMapPositionChange({ lat: center.lat(), lng: center.lng() }, zoom);
            }
          };

          // Listen for zoom and pan changes
          map.addListener('zoom_changed', savePosition);
          map.addListener('dragend', savePosition);
        }
      } catch (err) {
        console.error('Error initializing Google Maps:', err);
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        setIsLoading(false);
      }
    };

    initMap();
  }, []);

  // Handle skyways layer visibility
  useEffect(() => {
    if (!mapInstance) return;

    // Find the skyways layer in overlay map types
    let skywaysLayerIndex = -1;
    for (let i = 0; i < mapInstance.overlayMapTypes.getLength(); i++) {
      const layer = mapInstance.overlayMapTypes.getAt(i);
      if (layer && layer.name === 'Skyways') {
        skywaysLayerIndex = i;
        break;
      }
    }

    if (showSkywaysLayer) {
      // Add skyways layer if not already present
      if (skywaysLayerIndex === -1) {
        const skywaysLayer = createSkywaysLayer();
        mapInstance.overlayMapTypes.push(skywaysLayer);
      }
    } else {
      // Remove skyways layer if present
      if (skywaysLayerIndex !== -1) {
        mapInstance.overlayMapTypes.removeAt(skywaysLayerIndex);
      }
    }
  }, [mapInstance, showSkywaysLayer, createSkywaysLayer]);

  // Handle thermals layer visibility
  useEffect(() => {
    if (!mapInstance) return;

    // Find the thermals layer in overlay map types
    let thermalsLayerIndex = -1;
    for (let i = 0; i < mapInstance.overlayMapTypes.getLength(); i++) {
      const layer = mapInstance.overlayMapTypes.getAt(i);
      if (layer && layer.name === 'Thermals') {
        thermalsLayerIndex = i;
        break;
      }
    }

    if (showThermalsLayer) {
      // Add thermals layer if not already present
      if (thermalsLayerIndex === -1) {
        const thermalsLayer = createThermalsLayer();
        mapInstance.overlayMapTypes.push(thermalsLayer);
      }
    } else {
      // Remove thermals layer if present
      if (thermalsLayerIndex !== -1) {
        mapInstance.overlayMapTypes.removeAt(thermalsLayerIndex);
      }
    }
  }, [mapInstance, showThermalsLayer, createThermalsLayer]);

  return {
    mapRef,
    mapInstance,
    isLoading,
    error,
  };
};
