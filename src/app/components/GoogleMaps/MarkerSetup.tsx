import { WeatherStation, ParaglidingLocation } from '@/lib/supabase/types';
import { createParaglidingInfoWindow } from './ParaglidingInfoWindow';
import { createWeatherStationInfoWindow } from './WeatherStationInfoWindow';
import { paraglidingMarkerHTML } from './clusterer/sharedMarkerStyles';
import { weatherStationMarkerHTML } from './clusterer/sharedMarkerStyles';


interface MarkerManagerProps {
  paraglidingLocations: ParaglidingLocation[];
  weatherStations: WeatherStation[];
}

export const createAllMarkers = ({
  paraglidingLocations,
  weatherStations,
}: MarkerManagerProps) => {
  // Create paragliding markers with info windows
  const paraglidingMarkers = paraglidingLocations.map(location => {
    const marker = createParaglidingMarker(location);
    return marker;
  });

  // Create weather station markers with info windows
  const weatherStationMarkers = weatherStations.map(location => {
    const marker = createWeatherStationMarker(location);
    return marker;
  });

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



export const createParaglidingMarker = (location: ParaglidingLocation) => {
  const markerElement = document.createElement('div');
  markerElement.innerHTML = paraglidingMarkerHTML;

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude, lng: location.longitude },
    title: location.name,
    content: markerElement
  });

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1)';
  });

  return marker;
};



export const createWeatherStationMarker = (location: WeatherStation) => {
  const markerElement = document.createElement('div');
  markerElement.innerHTML = weatherStationMarkerHTML;

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude!, lng: location.longitude! },
    title: location.name,
    content: markerElement
  });

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1)';
  });

  return marker;
};
