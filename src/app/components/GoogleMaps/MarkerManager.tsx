import { WeatherStation, ParaglidingLocation } from '@/lib/supabase/types';
import { createParaglidingMarker } from './ParaglidingMarker';
import { createWeatherStationMarker } from './WeatherStationMarker';
import { createParaglidingInfoWindow } from './ParaglidingInfoWindow';
import { createWeatherStationInfoWindow } from './WeatherStationInfoWindow';

interface MarkerManagerProps {
  paraglidingLocations: ParaglidingLocation[];
  weatherStations: WeatherStation[];
  mapInstance: google.maps.Map;
}

// Global arrays to track all markers for cleanup
let allMarkers: google.maps.marker.AdvancedMarkerElement[] = [];
let allInfoWindows: google.maps.InfoWindow[] = [];

export const createAllMarkers = ({
  paraglidingLocations,
  weatherStations,
  mapInstance
}: MarkerManagerProps) => {
  // Clear previous markers first
  clearAllMarkers();

  // Create paragliding markers with info windows
  paraglidingLocations.forEach(location => {
    const marker = createParaglidingMarker({ location, mapInstance });
    const infoWindow = createParaglidingInfoWindow({ location });

    // Track markers and info windows for cleanup
    allMarkers.push(marker);
    allInfoWindows.push(infoWindow);

    // Add click event listener to the marker element
    const markerElement = marker.content as HTMLElement;
    markerElement.addEventListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });
  });

  // Create weather station markers with info windows
  weatherStations.forEach(location => {
    const marker = createWeatherStationMarker({ location, mapInstance });
    const infoWindow = createWeatherStationInfoWindow({ location });

    // Track markers and info windows for cleanup
    allMarkers.push(marker);
    allInfoWindows.push(infoWindow);

    // Add click event listener to the marker element
    const markerElement = marker.content as HTMLElement;
    markerElement.addEventListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });
  });
};

export const clearAllMarkers = () => {
  // Remove all markers from the map
  allMarkers.forEach(marker => {
    marker.map = null;
  });

  // Close all info windows
  allInfoWindows.forEach(infoWindow => {
    infoWindow.close();
  });

  // Clear the arrays
  allMarkers = [];
  allInfoWindows = [];
};
