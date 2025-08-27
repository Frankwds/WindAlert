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

export const createAllMarkers = ({
  paraglidingLocations,
  weatherStations,
  mapInstance
}: MarkerManagerProps) => {
  // Create paragliding markers with info windows
  paraglidingLocations.forEach(location => {
    const marker = createParaglidingMarker({ location, mapInstance });
    const infoWindow = createParaglidingInfoWindow({ location });

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

    // Add click event listener to the marker element
    const markerElement = marker.content as HTMLElement;
    markerElement.addEventListener('click', () => {
      infoWindow.open(mapInstance, marker);
    });
  });
};
