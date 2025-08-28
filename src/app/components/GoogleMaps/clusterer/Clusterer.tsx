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

  useEffect(() => {
    if (!map || markers.length === 0) {
      return;
    }

    if (!clustererRef.current) {
      clustererRef.current = new MarkerClusterer({
        map,
        markers: markers,
        renderer,
        algorithm: new SuperClusterAlgorithm({ ...algorithmOptions }),
      });
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [map, markers, renderer, algorithmOptions]);

  return null;
};

export default Clusterer;


