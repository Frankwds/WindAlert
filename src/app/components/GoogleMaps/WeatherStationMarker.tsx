import { WeatherStation } from '@/lib/supabase/types';
import { weatherStationMarkerHTML } from './clusterer/sharedMarkerStyles';

interface WeatherStationMarkerProps {
  location: WeatherStation;
}

export const createWeatherStationMarker = ({ location }: WeatherStationMarkerProps) => {
  const markerElement = document.createElement('div');
  markerElement.innerHTML = weatherStationMarkerHTML;

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude!, lng: location.longitude! },
    title: location.name,
    content: markerElement
  });

  // Add hover effects
  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1)';
  });

  return marker;
};
