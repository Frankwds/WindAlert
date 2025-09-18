import { useState, useCallback, useEffect } from 'react';
import { createParaglidingMarkers } from '../../MarkerSetup';
import { ParaglidingMarkerData } from '@/lib/supabase/types';
import { useParaglidingData } from '../data/useParaglidingData';

type Variant = 'main' | 'all';

interface UseParaglidingMarkersProps {
  mapInstance: google.maps.Map | null;
  onMarkerClick: (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingMarkerData) => void;
  variant: Variant;
}

export const useParaglidingMarkers = ({ mapInstance, onMarkerClick, variant }: UseParaglidingMarkersProps) => {
  const [paraglidingMarkers, setParaglidingMarkers] = useState<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [isLoadingMarkers, setIsLoadingMarkers] = useState(false);
  const [markersError, setMarkersError] = useState<string | null>(null);

  const { loadParaglidingData } = useParaglidingData({ variant });

  const loadMarkers = useCallback(async () => {
    if (isLoadingMarkers) return; // Prevent multiple simultaneous loads

    try {
      setIsLoadingMarkers(true);
      setMarkersError(null);

      const paraglidingLocations = await loadParaglidingData();
      const markers = createParaglidingMarkers(paraglidingLocations, onMarkerClick);

      setParaglidingMarkers(markers);
    } catch (err) {
      console.error('Error loading paragliding markers:', err);
      setMarkersError(err instanceof Error ? err.message : 'Failed to load paragliding markers');
    } finally {
      setIsLoadingMarkers(false);
    }
  }, [onMarkerClick, isLoadingMarkers, loadParaglidingData]);

  useEffect(() => {
    if (mapInstance && !isLoadingMarkers && paraglidingMarkers.length === 0) {
      loadMarkers();
    }
  }, [mapInstance, isLoadingMarkers, paraglidingMarkers.length, loadMarkers]);

  return {
    paraglidingMarkers,
    loadMarkers,
    isLoadingMarkers,
    markersError
  };
};
