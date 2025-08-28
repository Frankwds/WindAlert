'use client';

import { useEffect, useRef } from 'react';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { Renderer } from '@googlemaps/markerclusterer';
import { SuperClusterOptions } from '@googlemaps/markerclusterer/dist/algorithms/supercluster';

interface ClustererProps {
  map: google.maps.Map;
  markers: google.maps.marker.AdvancedMarkerElement[];
  renderer?: Renderer;
  algorithmOptions?: Partial<SuperClusterOptions>;
}

const Clusterer: React.FC<ClustererProps> = ({ map, markers, renderer, algorithmOptions }) => {
  const clustererRef = useRef<MarkerClusterer | null>(null);
  const previousMarkersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);

  useEffect(() => {
    if (!map || markers.length === 0) {
      return;
    }

    // Initialize MarkerClusterer if it doesn't exist
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({
        map,
        markers: markers, // Pass markers directly here
        renderer,
        algorithm: new SuperClusterAlgorithm({ ...algorithmOptions }),
      });
    } else {
      // Only update if markers actually changed
      const markersChanged = markers.length !== previousMarkersRef.current.length ||
        markers.some((marker, index) => marker !== previousMarkersRef.current[index]);

      if (markersChanged) {
        clustererRef.current.clearMarkers();
        clustererRef.current.addMarkers(markers);
        previousMarkersRef.current = [...markers];
      }
    }

    // Cleanup function
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [map, markers, renderer, algorithmOptions]);

  return null; // This component does not render anything
};

export default Clusterer;
