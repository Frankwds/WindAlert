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
  const algorithmRef = useRef<SuperClusterAlgorithm | null>(null);

  useEffect(() => {
    if (!map) {
      return;
    }

    // Create algorithm instance only once
    if (!algorithmRef.current) {
      algorithmRef.current = new SuperClusterAlgorithm(algorithmOptions || {});
    }

    // Create clusterer instance only once
    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({
        map,
        markers: [],
        renderer,
        algorithm: algorithmRef.current,
      });
    }

    // Update markers without recreating the clusterer
    if (markers.length === 0) {
      clustererRef.current.clearMarkers();
    } else {
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(markers);
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
      if (algorithmRef.current) {
        algorithmRef.current = null;
      }
    };
  }, [map, markers, renderer, algorithmOptions]);

  return null;
};

export default Clusterer;


