import { ParaglidingLocation } from '@/lib/supabase/types';

interface ParaglidingInfoWindowProps {
  location: ParaglidingLocation;
}

export const getParaglidingInfoWindowContent = ({ location }: ParaglidingInfoWindowProps): string => {
  return `
    <div class="p-3">
      <h3 class="font-bold text-lg mb-2">${location.name}</h3>
      <p class="text-sm text-gray-600 mb-2">🪂 Paragliding Spot</p>
      ${location.description ? `<p class="text-sm">${location.description}</p>` : ''}
      <div class="mt-3 text-xs text-gray-500">
        <p>Lat: ${location.latitude.toFixed(4)}°</p>
        <p>Lng: ${location.longitude.toFixed(4)}°</p>
        <p>Altitude: ${location.altitude}m</p>
        <p>Country: ${location.country}</p>
        ${location.flightlog_id ? `<p>FlightLog ID: ${location.flightlog_id}</p>` : ''}
      </div>
    </div>
  `;
};
