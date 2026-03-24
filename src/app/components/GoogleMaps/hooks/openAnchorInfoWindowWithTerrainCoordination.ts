import type { ReactElement } from 'react';
import { useCallback } from 'react';
import { createInfoWindowReactContent } from '../createInfoWindowReactContent';
import type { CloseOverlaysFn, OpenInfoWindowFn } from './controls';

export interface UseOpenAnchorInfoWindowWithTerrainCoordinationParams {
  mapInstance: google.maps.Map | null;
  clearPendingTerrainTap: () => void;
  closeOverlays: CloseOverlaysFn;
  openInfoWindow: OpenInfoWindowFn;
  markMarkerInfoWindowOpened: () => void;
}

/**
 * Opens an AdvancedMarker-anchored info window with React content, coordinated with the
 * map-background “terrain links” tap delay and marker-open guard (`useMapClickLinksInteraction`).
 */
export function useOpenAnchorInfoWindowWithTerrainCoordination({
  mapInstance,
  clearPendingTerrainTap,
  closeOverlays,
  openInfoWindow,
  markMarkerInfoWindowOpened,
}: UseOpenAnchorInfoWindowWithTerrainCoordinationParams) {
  return useCallback(
    (
      marker: google.maps.marker.AdvancedMarkerElement,
      content: ReactElement,
      options?: { closeFilterOverlays?: boolean }
    ) => {
      if (!mapInstance) return;
      const closeFilterOverlays = options?.closeFilterOverlays !== false;
      clearPendingTerrainTap();
      if (closeFilterOverlays) {
        closeOverlays();
      }
      const { container, dispose } = createInfoWindowReactContent(content);
      openInfoWindow(mapInstance, marker, container, { disposeContent: dispose });
      markMarkerInfoWindowOpened();
    },
    [mapInstance, clearPendingTerrainTap, closeOverlays, openInfoWindow, markMarkerInfoWindowOpened]
  );
}
