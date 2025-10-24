import { useState, useCallback, useEffect } from 'react';
import { createParaglidingMarkers, createLandingMarker } from '../../MarkerSetup';
import { ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import { useParaglidingData } from '../data/useParaglidingData';

type Variant = 'main' | 'all';

interface UseParaglidingLocationsAndLandingsProps {
  mapInstance: google.maps.Map | null;
  onParaglidingMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => void;
  onLandingMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => void;
  variant: Variant;
}

export const useParaglidingLocationsAndLandings = ({ 
  mapInstance, 
  onParaglidingMarkerClick, 
  onLandingMarkerClick, 
  variant 
}: UseParaglidingLocationsAndLandingsProps) => {
  const [paraglidingMarkers, setParaglidingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
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
      
      // Create paragliding markers
      const paraglidingMarkersArray = createParaglidingMarkers(paraglidingLocations, onParaglidingMarkerClick);
      setParaglidingMarkers(paraglidingMarkersArray);

      // Filter locations that have landing coordinates and create landing markers
      const locationsWithLandings = paraglidingLocations.filter(
        location => location.landing_latitude && location.landing_longitude
      );

      const landingMarkersArray = locationsWithLandings.map(location => {
        const marker = createLandingMarker(location);
        
        // Add click handler
        const markerElement = marker.content as HTMLElement;
        markerElement.addEventListener('click', (event: Event) => {
          event.stopPropagation();
          onLandingMarkerClick(marker, location);
        });

        return marker;
      });

      setLandingMarkers(landingMarkersArray);
    } catch (err) {
      console.error('Error loading paragliding and landing markers:', err);
      setMarkersError(err instanceof Error ? err.message : 'Failed to load paragliding and landing markers');
    } finally {
      setIsLoadingMarkers(false);
    }
  }, [onParaglidingMarkerClick, onLandingMarkerClick, isLoadingMarkers, loadParaglidingData]);

  useEffect(() => {
    if (mapInstance && !isLoadingMarkers && paraglidingMarkers.length === 0 && landingMarkers.length === 0) {
      loadMarkers();
    }
  }, [mapInstance, isLoadingMarkers, paraglidingMarkers.length, landingMarkers.length, loadMarkers]);

  return {
    paraglidingMarkers,
    landingMarkers,
    loadMarkers,
    isLoadingMarkers,
    markersError
  };
};
