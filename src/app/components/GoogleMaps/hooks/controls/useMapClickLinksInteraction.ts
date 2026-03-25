import { useCallback, useEffect, useRef } from 'react';
import { createInfoWindowReactContent } from '../../createInfoWindowReactContent';
import { getMapClickLinksInfoWindow } from '../../InfoWindows';
import type { CloseOverlaysFn } from './useOverlayManagement';
import type { OpenInfoWindowFn } from './useInfoWindows';

/** Wait longer than double-click interval so zoom does not also open the links popup. */
const SINGLE_TAP_DELAY_MS = 260;

/**
 * Ignore a map click shortly after opening a marker info window — Maps can emit a map click
 * in the same gesture sequence as the marker tap on some platforms.
 */
const MARKER_INFO_WINDOW_OPEN_GUARD_MS = 180;

export const MAP_CLICK_LINKS_INFO_WINDOW_SIZE = {
  minWidth: 96,
  maxWidth: 120,
} as const;

interface UseMapClickLinksInteractionProps {
  /** When set, registers this feature’s map listeners; cleans up when null or on unmount. */
  mapInstance: google.maps.Map | null;
  overlaysOpen: boolean;
  closeOverlays: CloseOverlaysFn;
  openInfoWindow: OpenInfoWindowFn;
  isInfoWindowOpen: () => boolean;
}

/**
 * Map background tap: delayed single-tap opens a compact Yr / Google Maps links info window;
 * coordinates with double-tap zoom, filter overlays, and marker-driven info windows (mobile ordering).
 *
 * Owns `click` / `dblclick` listeners on `mapInstance` so the map bootstrap hook stays unaware of this feature.
 *
 * For marker-anchored React info windows, use `useOpenAnchorInfoWindowWithTerrainCoordination`; it calls
 * `clearPendingTerrainTap` and `markMarkerInfoWindowOpened` in the right order. Call those yourself only
 * if you open via `openInfoWindow` without that hook (rare).
 */
export function useMapClickLinksInteraction({
  mapInstance,
  overlaysOpen,
  closeOverlays,
  openInfoWindow,
  isInfoWindowOpen,
}: UseMapClickLinksInteractionProps) {
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  mapInstanceRef.current = mapInstance;

  const overlaysOpenRef = useRef(overlaysOpen);
  const closeOverlaysRef = useRef(closeOverlays);
  const openInfoWindowRef = useRef<OpenInfoWindowFn>(openInfoWindow);
  const isInfoWindowOpenRef = useRef(isInfoWindowOpen);

  useEffect(() => {
    overlaysOpenRef.current = overlaysOpen;
    closeOverlaysRef.current = closeOverlays;
    openInfoWindowRef.current = openInfoWindow;
    isInfoWindowOpenRef.current = isInfoWindowOpen;
  }, [overlaysOpen, closeOverlays, openInfoWindow, isInfoWindowOpen]);

  const pendingSingleTapTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastMarkerInfoWindowOpenedAtRef = useRef(0);

  const clearPendingTerrainTap = useCallback(() => {
    if (pendingSingleTapTimeoutRef.current) {
      clearTimeout(pendingSingleTapTimeoutRef.current);
      pendingSingleTapTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearPendingTerrainTap();
    };
  }, [clearPendingTerrainTap]);

  const handleMapClick = useCallback(
    (position?: google.maps.LatLngLiteral) => {
      if (overlaysOpenRef.current) {
        clearPendingTerrainTap();
        closeOverlaysRef.current();
        return;
      }

      if (isInfoWindowOpenRef.current()) {
        clearPendingTerrainTap();
        const msSinceMarkerOpen = Date.now() - lastMarkerInfoWindowOpenedAtRef.current;
        if (msSinceMarkerOpen < MARKER_INFO_WINDOW_OPEN_GUARD_MS) {
          return;
        }
        closeOverlaysRef.current();
        return;
      }

      if (pendingSingleTapTimeoutRef.current) {
        clearPendingTerrainTap();
        return;
      }

      pendingSingleTapTimeoutRef.current = setTimeout(() => {
        pendingSingleTapTimeoutRef.current = null;

        closeOverlaysRef.current({ keep: 'infowindow' });
        const map = mapInstanceRef.current;
        if (!position || !map) return;
        if (isInfoWindowOpenRef.current()) return;

        const { container, dispose } = createInfoWindowReactContent(
          getMapClickLinksInfoWindow(position.lat, position.lng)
        );
        openInfoWindowRef.current(map, position, container, {
          ...MAP_CLICK_LINKS_INFO_WINDOW_SIZE,
          disposeContent: dispose,
        });
      }, SINGLE_TAP_DELAY_MS);
    },
    [clearPendingTerrainTap]
  );

  const handleMapDoubleClick = useCallback(() => {
    clearPendingTerrainTap();
  }, [clearPendingTerrainTap]);

  const handleMapClickRef = useRef(handleMapClick);
  const handleMapDoubleClickRef = useRef(handleMapDoubleClick);
  handleMapClickRef.current = handleMapClick;
  handleMapDoubleClickRef.current = handleMapDoubleClick;

  useEffect(() => {
    if (!mapInstance) return;

    const clickListener = mapInstance.addListener('click', (event: google.maps.MapMouseEvent) => {
      // No position → cannot anchor the links popup; skip (avoids arming delay + closeOverlays churn).
      if (!event.latLng) return;
      handleMapClickRef.current({
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      });
    });
    const dblClickListener = mapInstance.addListener('dblclick', () => {
      handleMapDoubleClickRef.current();
    });

    return () => {
      clickListener.remove();
      dblClickListener.remove();
    };
  }, [mapInstance]);

  const markMarkerInfoWindowOpened = useCallback(() => {
    lastMarkerInfoWindowOpenedAtRef.current = Date.now();
  }, []);

  return {
    clearPendingTerrainTap,
    markMarkerInfoWindowOpened,
  };
}
