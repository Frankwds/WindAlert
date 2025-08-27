'use client';

import { useEffect, useRef } from 'react';
import { MarkerClusterer, SuperClusterAlgorithm } from '@googlemaps/markerclusterer';
import { Marker, Renderer } from '@googlemaps/markerclusterer';
import { SuperClusterOptions } from '@googlemaps/markerclusterer/dist/algorithms/supercluster';

interface ClustererProps {
  map: google.maps.Map;
  markers: Marker[];
  renderer?: Renderer;
  algorithmOptions?: Partial<SuperClusterOptions>;
}

const Clusterer: React.FC<ClustererProps> = ({ map, markers, renderer, algorithmOptions }) => {
  const clustererRef = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;

    // Initialize MarkerClusterer
    clustererRef.current = new MarkerClusterer({
      map,
      markers: [],
      renderer,
      algorithm: new SuperClusterAlgorithm({ ...algorithmOptions }),
    });

    // Cleanup function
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [map, renderer, algorithmOptions]);

  useEffect(() => {
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(markers);
    }
  }, [markers]);

  return null; // This component does not render anything
};

export default Clusterer;
