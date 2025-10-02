import { useCallback } from 'react';

/**
 * Creates a custom map layer for thermal data with scaling support
 * Handles zoom levels beyond the native maximum by scaling lower resolution tiles
 */
export const useThermalsLayer = () => {
  const createThermalsLayer = useCallback(() => {
    return {
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 18,
      minZoom: 1,
      name: 'Thermals',
      alt: 'Thermals thermal data layer',

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

  return { createThermalsLayer };
};

/**
 * Creates a custom map layer for skyways data with scaling support
 * Handles zoom levels beyond the native maximum by scaling lower resolution tiles
 */
export const useSkywaysLayer = () => {
  const createSkywaysLayer = useCallback(() => {
    return {
      tileSize: new google.maps.Size(256, 256),
      maxZoom: 18,
      minZoom: 1,
      name: 'Skyways',
      alt: 'Skyways thermal data layer',

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
          img.src = `https://thermal.kk7.ch/tiles/skyways_all_all/${zoom}/${coord.x}/${invertedY}.png?src=${window.location.hostname}`;
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
        img.src = `https://thermal.kk7.ch/tiles/skyways_all_all/${maxNativeZoom}/${nativeX}/${invertedNativeY}.png?src=${window.location.hostname}`;

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
