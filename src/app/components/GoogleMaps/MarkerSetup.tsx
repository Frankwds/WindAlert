import { WeatherStationMarkerData, ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import { createParaglidingMarkerElementWithDirection, createWeatherStationWindMarkerElement } from './Markers';

type onParaglidingMarkerClickHandler = (marker: google.maps.marker.AdvancedMarkerElement, location: ParaglidingLocationWithForecast) => void;
type onWeatherStationMarkerClickHandler = (marker: google.maps.marker.AdvancedMarkerElement, location: WeatherStationMarkerData) => void;

export const createParaglidingMarkers = (paraglidingLocations: ParaglidingLocationWithForecast[], onMarkerClick: onParaglidingMarkerClickHandler) => {
  return paraglidingLocations.map(location => {
    const marker = createParaglidingMarker(location, onMarkerClick);
    return marker;
  });
};

export const createWeatherStationMarkers = (weatherStations: WeatherStationMarkerData[], onMarkerClick: onWeatherStationMarkerClickHandler) => {
  return weatherStations.map(location => {
    const marker = createWeatherStationMarker(location, onMarkerClick);
    return marker;
  });
};

export const createParaglidingMarker = (location: ParaglidingLocationWithForecast, onMarkerClick: onParaglidingMarkerClickHandler) => {
  const markerElement = createParaglidingMarkerElementWithDirection(location);

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude, lng: location.longitude },
    title: location.name,
    content: markerElement
  });

  // Store the location data with the marker for filtering purposes
  (marker as any).locationData = location;

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1)';
  });

  markerElement.addEventListener('click', (event: Event) => {
    event.stopPropagation();
    onMarkerClick(marker, location);
  });

  return marker;
};

export const createWeatherStationMarker = (location: WeatherStationMarkerData, onMarkerClick: onWeatherStationMarkerClickHandler) => {
  const markerElement = createWeatherStationWindMarkerElement(location.station_data);

  // Store wind data in the marker element for cluster access
  const latestData = location.station_data
    .filter(data => data.wind_speed !== null && data.direction !== null)
    .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())[0];

  if (latestData) {
    markerElement.dataset.windSpeed = latestData.wind_speed.toString();
    markerElement.dataset.windDirection = latestData.direction.toString();
  }

  const marker = new google.maps.marker.AdvancedMarkerElement({
    position: { lat: location.latitude!, lng: location.longitude! },
    title: location.name,
    content: markerElement,
  });
  marker.zIndex = 2000;

  markerElement.addEventListener('mouseenter', () => {
    markerElement.style.transform = 'scale(1.1)';
  });

  markerElement.addEventListener('mouseleave', () => {
    markerElement.style.transform = 'scale(1)';
  });

  markerElement.addEventListener('click', (event: Event) => {
    // Prevent the click event from bubbling up to the map
    event.stopPropagation();
    onMarkerClick(marker, location);
  });


  return marker;
};
