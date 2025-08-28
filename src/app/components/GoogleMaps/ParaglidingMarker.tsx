import { ParaglidingLocation } from '@/lib/supabase/types';
import { paraglidingMarkerHTML } from './clusterer/sharedMarkerStyles';

interface ParaglidingMarkerProps {
  location: ParaglidingLocation;
}

export const createParaglidingMarker = ({ location }: ParaglidingMarkerProps) => {
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
