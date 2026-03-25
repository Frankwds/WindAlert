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
 * Preferred entry point for marker-anchored React info windows on this map: clears the terrain
 * tap delay, optionally closes filter overlays, mounts content via `createInfoWindowReactContent`,
 * opens the shared `InfoWindow`, and updates the marker-open guard used by
 * `useMapClickLinksInteraction`.
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
