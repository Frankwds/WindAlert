import { WeatherStation, ParaglidingLocation } from '@/lib/supabase/types';
import { createParaglidingMarker } from './ParaglidingMarker';
import { createWeatherStationMarker } from './WeatherStationMarker';
import { createParaglidingInfoWindow } from './ParaglidingInfoWindow';
import { createWeatherStationInfoWindow } from './WeatherStationInfoWindow';

interface MarkerManagerProps {
  paraglidingLocations: ParaglidingLocation[];
  weatherStations: WeatherStation[];
  mapInstance?: google.maps.Map | null;
}

// Helper function to create paragliding markers with info windows
const createParaglidingMarkersWithInfoWindows = (
  locations: ParaglidingLocation[],
  mapInstance?: google.maps.Map | null
): google.maps.marker.AdvancedMarkerElement[] => {
  return locations.map(location => {
    const marker = createParaglidingMarker({ location });

    // Only set up click handlers if we have a map instance
    if (mapInstance) {
      const infoWindow = createParaglidingInfoWindow({ location });
      const markerElement = marker.content as HTMLElement;
      markerElement.addEventListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });
    }

    return marker;
  });
};

// Helper function to create weather station markers with info windows
const createWeatherStationMarkersWithInfoWindows = (
  locations: WeatherStation[],
  mapInstance?: google.maps.Map | null
): google.maps.marker.AdvancedMarkerElement[] => {
  return locations.map(location => {
    const marker = createWeatherStationMarker({ location });

    // Only set up click handlers if we have a map instance
    if (mapInstance) {
      const infoWindow = createWeatherStationInfoWindow({ location });
      const markerElement = marker.content as HTMLElement;
      markerElement.addEventListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });
    }

    return marker;
  });
};

export const createAllMarkers = ({
  paraglidingLocations,
  weatherStations,
  mapInstance,
}: MarkerManagerProps) => {
  // Create paragliding markers with info windows
  const paraglidingMarkers = createParaglidingMarkersWithInfoWindows(
    paraglidingLocations,
    mapInstance
  );

  // Create weather station markers with info windows
  const weatherStationMarkers = createWeatherStationMarkersWithInfoWindows(
    weatherStations,
    mapInstance
  );

  return { paraglidingMarkers, weatherStationMarkers };
};

/**
 * Set up click handlers for markers after they're created
 * This is useful when markers are created without a map instance initially
 */
export const setupMarkerClickHandlers = (
  markers: google.maps.marker.AdvancedMarkerElement[],
  locations: (ParaglidingLocation | WeatherStation)[],
  mapInstance: google.maps.Map,
  isParagliding: boolean
) => {
  markers.forEach((marker, index) => {
    const location = locations[index];
    const markerElement = marker.content as HTMLElement;

    // Remove any existing click listeners
    markerElement.removeEventListener('click', markerElement.onclick as any);

    if (isParagliding) {
      const infoWindow = createParaglidingInfoWindow({ location: location as ParaglidingLocation });
      markerElement.addEventListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });
    } else {
      const infoWindow = createWeatherStationInfoWindow({ location: location as WeatherStation });
      markerElement.addEventListener('click', () => {
        infoWindow.open(mapInstance, marker);
      });
    }
  });
};
