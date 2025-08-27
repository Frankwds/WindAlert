import { WeatherStation } from '@/lib/supabase/types';

interface WeatherStationMarkerProps {
  location: WeatherStation;
}

export const createWeatherStationMarker = ({ location }: WeatherStationMarkerProps) => {
  const markerElement = document.createElement('div');
  markerElement.innerHTML = `
    <div style="
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: #4ECDC4;
      border: 2px solid white;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      transition: transform 0.2s ease;
    ">
      W
    </div>
  `;

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
