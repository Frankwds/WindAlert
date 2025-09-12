import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader } from '@googlemaps/js-api-loader';

const MAP_CONFIG = {
  DEFAULT_CENTER: { lat: 60.5, lng: 8.5 },
  DEFAULT_ZOOM: 5,
  MAP_ID: 'WindLordMapID'
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
  onMapPositionChange: (center: { lat: number; lng: number }, zoom: number) => void;
}

export const useMapInstance = ({ initialMapState, onMapReady, onMapClick, showSkywaysLayer = false, onMapPositionChange }: UseMapInstanceProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to avoid dependency issues
  const onMapReadyRef = useRef(onMapReady);
  const onMapClickRef = useRef(onMapClick);

  // Update refs when callbacks change
  useEffect(() => {
    onMapReadyRef.current = onMapReady;
  }, [onMapReady]);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  const createSkywaysLayer = useCallback(() => {
    return new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        const x = coord.x;
        const y = coord.y;
        // Invert y for TMS (Tile Map Service) format
        const invertedY = Math.pow(2, zoom) - 1 - y;
        return `https://thermal.kk7.ch/tiles/skyways_all_all/${zoom}/${x}/${invertedY}.png?src=${window.location.hostname}`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 18,
      minZoom: 1,
      name: 'Skyways',
      alt: 'Skyways thermal data layer'
    });
  }, []);

  useEffect(() => {
    const initMap = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey || apiKey === 'GOOGLE_MAPS_API_KEY') {
          throw new Error('Google Maps API key is not configured. Please set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY in your environment variables.');
        }

        const loader = new Loader({
          apiKey,
          version: 'weekly',
          libraries: ['places', 'marker']
        });

        const google = await loader.load();

        if (!mapRef.current) return;

        const map = new google.maps.Map(mapRef.current, {
          center: initialMapState?.center ?? MAP_CONFIG.DEFAULT_CENTER,
          zoom: initialMapState?.zoom ?? MAP_CONFIG.DEFAULT_ZOOM,
          mapTypeId: google.maps.MapTypeId.TERRAIN,
          mapId: MAP_CONFIG.MAP_ID,
          streetViewControl: false,
          disableDefaultUI: true,
          fullscreenControl: false,
          zoomControl: false,
          clickableIcons: false,
          scrollwheel: true
        });

        map.addListener('click', () => onMapClickRef.current());
        map.setOptions({ scaleControl: true });

        setMapInstance(map);
        setIsLoading(false);
        onMapReadyRef.current(map);

        // Add listeners for map position changes after map is fully initialized

        if (onMapPositionChange) {
          const savePosition = () => {
            const center = map.getCenter();
            const zoom = map.getZoom();
            if (center && zoom) {
              onMapPositionChange(
                { lat: center.lat(), lng: center.lng() },
                zoom
              );
            }
          }

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

  return {
    mapRef,
    mapInstance,
    isLoading,
    error,
    createSkywaysLayer
  };
};
