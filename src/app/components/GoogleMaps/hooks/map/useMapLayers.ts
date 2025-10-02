import { useCallback } from 'react';

interface LayerConfig {
  name: string;
  alt: string;
  tilePath: string;
}

/**
 * Creates the base configuration for thermal/skyways layers
 */
const createBaseLayerConfig = (config: LayerConfig) => ({
  tileSize: new google.maps.Size(256, 256),
  maxZoom: 20,
  minZoom: 1,
  name: config.name,
  alt: config.alt,
  releaseTile: () => { },
  projection: null,
  radius: 6378137,
});

/**
 * Creates a tile element for native zoom levels
 */
const createNativeTile = (
  coord: google.maps.Point,
  zoom: number,
  ownerDocument: Document,
  tilePath: string
) => {
  const img = ownerDocument.createElement('img');
  if (!coord) return img;

  const invertedY = Math.pow(2, zoom) - 1 - coord.y;
  img.src = `https://thermal.kk7.ch/tiles/${tilePath}/${zoom}/${coord.x}/${invertedY}.png?src=${window.location.hostname}`;
  img.style.width = '256px';
  img.style.height = '256px';
  return img;
};

/**
 * Creates a scaled tile container for zoom levels beyond native maximum
 */
const createScaledTile = (
  coord: google.maps.Point,
  zoom: number,
  ownerDocument: Document,
  tilePath: string,
  maxNativeZoom: number
) => {
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
  img.src = `https://thermal.kk7.ch/tiles/${tilePath}/${maxNativeZoom}/${nativeX}/${invertedNativeY}.png?src=${window.location.hostname}`;

  img.style.width = `${256 * scale}px`;
  img.style.height = `${256 * scale}px`;
  img.style.position = 'absolute';

  const xOffset = coord.x % scale;
  const yOffset = coord.y % scale;

  img.style.left = `-${xOffset * 256}px`;
  img.style.top = `-${yOffset * 256}px`;

  div.appendChild(img);
  return div;
};

/**
 * Creates a thermal/skyways layer with scaling support
 */
const createThermalLayer = (config: LayerConfig) => {
  const baseConfig = createBaseLayerConfig(config);
  const maxNativeZoom = 12;

  return {
    ...baseConfig,
    getTile: (coord: google.maps.Point, zoom: number, ownerDocument: Document) => {
      if (zoom <= maxNativeZoom) {
        return createNativeTile(coord, zoom, ownerDocument, config.tilePath);
      }
      return createScaledTile(coord, zoom, ownerDocument, config.tilePath, maxNativeZoom);
    }
  };
};

/**
 * Creates a custom map layer for thermal data with scaling support
 * Handles zoom levels beyond the native maximum by scaling lower resolution tiles
 */
export const useThermalsLayer = () => {
  const createThermalsLayer = useCallback(() => {
    return createThermalLayer({
      name: 'Thermals',
      alt: 'Thermals thermal data layer',
      tilePath: 'thermals_all_all'
    });
  }, []);

  return { createThermalsLayer };
};

/**
 * Creates a custom map layer for skyways data with scaling support
 * Handles zoom levels beyond the native maximum by scaling lower resolution tiles
 */
export const useSkywaysLayer = () => {
  const createSkywaysLayer = useCallback(() => {
    return createThermalLayer({
      name: 'Skyways',
      alt: 'Skyways thermal data layer',
      tilePath: 'skyways_all_all'
    });
  }, []);

  return { createSkywaysLayer };
};

/**
 * Creates an OpenStreetMap map type
 */
export const useOSMMapType = () => {
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

  return { createOSMMapType };
};
