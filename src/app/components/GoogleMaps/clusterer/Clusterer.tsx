'use client';

import { useEffect, useRef } from 'react';
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Marker } from '@googlemaps/markerclusterer';

interface ClustererProps {
  map: google.maps.Map;
  markers: Marker[];
}

const Clusterer: React.FC<ClustererProps> = ({ map, markers }) => {
  const clustererRef = useRef<MarkerClusterer | null>(null);

  useEffect(() => {
    if (!map) return;

    // Initialize MarkerClusterer
    clustererRef.current = new MarkerClusterer({ map, markers: [] });

    // Cleanup function
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers();
        clustererRef.current = null;
      }
    };
  }, [map]);

  useEffect(() => {
    if (clustererRef.current) {
      clustererRef.current.clearMarkers();
      clustererRef.current.addMarkers(markers);
    }
  }, [markers]);

  return null; // This component does not render anything
};

export default Clusterer;
