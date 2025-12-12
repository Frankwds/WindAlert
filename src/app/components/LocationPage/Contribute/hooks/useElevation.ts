import { useEffect, useState, useRef } from 'react';

interface UseElevationProps {
  latitude: number | undefined | null;
  longitude: number | undefined | null;
  enabled?: boolean;
}

interface UseElevationReturn {
  altitude: number | undefined;
  isLoading: boolean;
  error: string | null;
}

export const useElevation = ({ latitude, longitude, enabled = true }: UseElevationProps): UseElevationReturn => {
  const [altitude, setAltitude] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const elevationServiceRef = useRef<google.maps.ElevationService | null>(null);

  // Initialize elevation service
  useEffect(() => {
    const initElevationService = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const google = (window as any).google;
      if (google?.maps?.ElevationService) {
        elevationServiceRef.current = new google.maps.ElevationService();
        return true;
      }
      return false;
    };

    // Try immediately
    if (initElevationService()) {
      return;
    }

    // If not available, check periodically (Google Maps might still be loading)
    const interval = setInterval(() => {
      if (initElevationService()) {
        clearInterval(interval);
      }
    }, 100);

    // Cleanup after 5 seconds (should be enough for Google Maps to load)
    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 5000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, []);

  // Fetch elevation when coordinates change
  useEffect(() => {
    if (!enabled || !latitude || !longitude || !elevationServiceRef.current) {
      setAltitude(undefined);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    const request: google.maps.LocationElevationRequest = {
      locations: [{ lat: latitude, lng: longitude }],
    };

    elevationServiceRef.current.getElevationForLocations(request, (results, status) => {
      if (status === google.maps.ElevationStatus.OK && results && results.length > 0) {
        setAltitude(Math.round(results[0].elevation));
        setError(null);
      } else {
        setError('Kunne ikke hente høyde automatisk. Du kan skrive inn høyde manuelt.');
        setAltitude(undefined);
      }
      setIsLoading(false);
    });
  }, [latitude, longitude, enabled]);

  return {
    altitude,
    isLoading,
    error,
  };
};
