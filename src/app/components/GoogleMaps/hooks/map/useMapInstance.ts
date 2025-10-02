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
  showThermalsLayer: boolean;
  onMapPositionChange: (center: { lat: number; lng: number }, zoom: number) => void;
  initialMapType?: 'terrain' | 'satellite' | 'osm';
}

export const useMapInstance = ({ initialMapState, onMapReady, onMapClick, showSkywaysLayer = false, showThermalsLayer = false, onMapPositionChange, initialMapType = 'terrain' }: UseMapInstanceProps) => {
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

  const createThermalsLayer = useCallback(() => {
    return {
      // --- Your existing, correct properties ---
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 18,
      minZoom: 1,
      name: 'Thermals',
      alt: 'Thermals thermal data layer',

      // --- ADDED: Missing properties to satisfy the MapType interface ---

      /**
       * releaseTile is a memory management function.
       * Google Maps calls this when a tile goes out of view.
       * For simple image tiles, we don't need to do any cleanup,
       * so an empty function is sufficient.
       */
      releaseTile: () => { },

      // The following properties are not used for a simple overlay like this,
      // but we add them as to satisfy the TypeScript interface.
      projection: null,
      radius: 6378137,

      getTile: (coord: google.maps.Point, zoom: number, ownerDocument: Document) => {
        const maxNativeZoom = 12;

        if (zoom <= maxNativeZoom) {
          const img = ownerDocument.createElement('img');
          if (!coord) return img;

          const invertedY = Math.pow(2, zoom) - 1 - coord.y;
          img.src = `https://thermal.kk7.ch/tiles/thermals_all_all/${zoom}/${coord.x}/${invertedY}.png?src=${window.location.hostname}`;
          img.style.width = '256px';
          img.style.height = '256px';
          return img;
        }

        const div = ownerDocument.createElement('div');
        div.style.width = '256px';
        div.style.height = '256px';
        div.style.overflow = 'hidden';

        if (!coord) return div;

        const zoomDiff = zoom - maxNativeZoom;
        const scale = Math.pow(2, zoomDiff);

        const nativeX = Math.floor(coord.x / scale);
        const nativeY = Math.floor(coord.y / scale);

        const img = ownerDocument.createElement('img');
        const invertedNativeY = Math.pow(2, maxNativeZoom) - 1 - nativeY;
        img.src = `https://thermal.kk7.ch/tiles/thermals_all_all/${maxNativeZoom}/${nativeX}/${invertedNativeY}.png?src=${window.location.hostname}`;

        img.style.width = `${256 * scale}px`;
        img.style.height = `${256 * scale}px`;
        img.style.position = 'absolute';

        const xOffset = coord.x % scale;
        const yOffset = coord.y % scale;

        img.style.left = `-${xOffset * 256}px`;
        img.style.top = `-${yOffset * 256}px`;

        div.appendChild(img);
        return div;
      }
    };
  }, []);

  const createOSMMapType = useCallback(() => {
    return new google.maps.ImageMapType({
      getTileUrl: (coord, zoom) => {
        const x = coord.x;
        const y = coord.y;
        return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
      },
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 19,
      minZoom: 1,
      name: 'OpenStreetMap',
      alt: 'OpenStreetMap tiles'
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

        const mapTypeId = initialMapType === 'osm'
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
          scrollwheel: true
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
    error
  };
};
