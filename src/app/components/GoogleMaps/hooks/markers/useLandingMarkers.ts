import { useState, useCallback, useEffect } from 'react';
import { createLandingMarker } from '../../MarkerSetup';
import { ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import { useParaglidingData } from '../data/useParaglidingData';

type Variant = 'main' | 'all';

interface UseLandingMarkersProps {
  mapInstance: google.maps.Map | null;
  onLandingMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => void;
  variant: Variant;
}

export const useLandingMarkers = ({ mapInstance, onLandingMarkerClick, variant }: UseLandingMarkersProps) => {
  const [landingMarkers, setLandingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const { loadParaglidingData } = useParaglidingData({ variant });

  const loadMarkers = useCallback(async () => {
    if (isLoadingMarkers) return; // Prevent multiple simultaneous loads

    try {
      setIsLoadingMarkers(true);
      setMarkersError(null);

      const paraglidingLocations = await loadParaglidingData();
      
      // Filter locations that have landing coordinates
      const locationsWithLandings = paraglidingLocations.filter(
        location => location.landing_latitude && location.landing_longitude
      );

      // Create landing markers
      const markers = locationsWithLandings.map(location => {
        const marker = createLandingMarker(location);
        
        // Add click handler
        const markerElement = marker.content as HTMLElement;
        markerElement.addEventListener('click', (event: Event) => {
          event.stopPropagation();
          onLandingMarkerClick(marker, location);
        });

        return marker;
      });

      setLandingMarkers(markers);
    } catch (err) {
      console.error('Error loading landing markers:', err);
      setMarkersError(err instanceof Error ? err.message : 'Failed to load landing markers');
    } finally {
      setIsLoadingMarkers(false);
    }
  }, [onLandingMarkerClick, isLoadingMarkers, loadParaglidingData]);

  useEffect(() => {
    if (mapInstance && !isLoadingMarkers && landingMarkers.length === 0) {
      loadMarkers();
    }
  }, [mapInstance, isLoadingMarkers, landingMarkers.length, loadMarkers]);

  return {
    landingMarkers,
    loadMarkers,
    isLoadingMarkers,
    markersError
  };
};
