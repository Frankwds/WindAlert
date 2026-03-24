import { useCallback, useRef } from 'react';

export type InfoWindowAnchor = google.maps.marker.AdvancedMarkerElement | google.maps.LatLngLiteral;

export type OpenInfoWindowOptions = {
  minWidth?: number;
  maxWidth?: number;
  disposeContent?: () => void;
};

export type OpenInfoWindowFn = (
  mapInstance: google.maps.Map,
  anchor: InfoWindowAnchor,
  content: string | HTMLElement,
  options?: OpenInfoWindowOptions
) => void;

export const useInfoWindows = () => {
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const isLatLngLiteral = (value: unknown): value is google.maps.LatLngLiteral => {
    return (
      typeof value === 'object' &&
      value !== null &&
      'lat' in value &&
      'lng' in value &&
      typeof (value as { lat: unknown }).lat === 'number' &&
      typeof (value as { lng: unknown }).lng === 'number'
    );
  };

  const disposePreviousReactContentRef = useRef<(() => void) | null>(null);

  const disposePreviousReactContent = useCallback(() => {
    disposePreviousReactContentRef.current?.();
    disposePreviousReactContentRef.current = null;
  }, []);

  const closeInfoWindow = useCallback(() => {
    disposePreviousReactContent();
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, [disposePreviousReactContent]);

  /** True while the window is attached to a map (Maps API exposes internal `map` via `get`). */
  const isInfoWindowOpen = useCallback(() => {
    return Boolean(infoWindowRef.current?.get('map'));
  }, []);

  const openInfoWindow = useCallback(
    (mapInstance: google.maps.Map, anchor: InfoWindowAnchor, content: string | HTMLElement, options?: OpenInfoWindowOptions) => {
      if (infoWindowRef.current && mapInstance) {
        disposePreviousReactContent();
        if (options?.disposeContent) {
          disposePreviousReactContentRef.current = options.disposeContent;
        }
        // Close any existing info window first
        infoWindowRef.current.close();
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.setOptions({
          minWidth: options?.minWidth,
          maxWidth: options?.maxWidth,
        });
        if (isLatLngLiteral(anchor)) {
          infoWindowRef.current.setPosition(anchor);
          infoWindowRef.current.open({
            map: mapInstance,
            shouldFocus: false,
          });
          return;
        }
        infoWindowRef.current.open({
          map: mapInstance,
          anchor,
          shouldFocus: false,
        });
      }
    },
    [disposePreviousReactContent]
  );

  return {
    infoWindowRef,
    closeInfoWindow,
    isInfoWindowOpen,
    openInfoWindow,
  };
};
