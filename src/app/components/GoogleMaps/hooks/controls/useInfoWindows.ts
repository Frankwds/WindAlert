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

export type InfoWindowWithWeatherStationId = google.maps.InfoWindow & {
  __weatherStationId?: string;
};

const isWeatherStationMarkerAnchor = (anchor: InfoWindowAnchor): anchor is google.maps.marker.AdvancedMarkerElement => {
  if (typeof anchor !== 'object' || anchor === null || 'lat' in anchor) {
    return false;
  }
  const locationData = (anchor as { locationData?: { station_data?: unknown; station_id?: string } }).locationData;
  return Boolean(locationData?.station_data && locationData.station_id);
};

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

  const clearWeatherStationTracking = useCallback(() => {
    const infoWindow = infoWindowRef.current as InfoWindowWithWeatherStationId | null;
    if (infoWindow) {
      delete infoWindow.__weatherStationId;
    }
  }, []);

  const closeInfoWindow = useCallback(() => {
    disposePreviousReactContent();
    clearWeatherStationTracking();
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, [clearWeatherStationTracking, disposePreviousReactContent]);

  /**
   * True while the shared InfoWindow is attached to a map.
   *
   * Implemented with `infoWindow.get('map')`, which is widely used with the Maps JS API but is not
   * documented as a stable public contract. If Google changes internals, switch to a supported
   * signal (e.g. track open/close via `closeclick` and explicit `open`/`close` paths).
   */
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
          clearWeatherStationTracking();
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
        const infoWindow = infoWindowRef.current as InfoWindowWithWeatherStationId;
        if (isWeatherStationMarkerAnchor(anchor)) {
          const locationData = (anchor as { locationData?: { station_id: string } }).locationData;
          infoWindow.__weatherStationId = locationData!.station_id;
        } else {
          delete infoWindow.__weatherStationId;
        }
      }
    },
    [clearWeatherStationTracking, disposePreviousReactContent]
  );

  return {
    infoWindowRef,
    closeInfoWindow,
    isInfoWindowOpen,
    openInfoWindow,
  };
};
