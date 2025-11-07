import { useCallback, useRef } from 'react';

export const useInfoWindows = () => {
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);

  const closeInfoWindow = useCallback(() => {
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
    }
  }, []);

  const openInfoWindow = useCallback(
    (mapInstance: google.maps.Map, marker: google.maps.marker.AdvancedMarkerElement, content: string | HTMLElement) => {
      if (infoWindowRef.current && mapInstance) {
        // Close any existing info window first
        infoWindowRef.current.close();
        infoWindowRef.current.setContent(content);
        infoWindowRef.current.open(mapInstance, marker);
      }
    },
    []
  );

  return {
    infoWindowRef,
    closeInfoWindow,
    openInfoWindow,
  };
};
