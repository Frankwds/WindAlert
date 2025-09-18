import React from 'react';
import { ParaglidingMarkerData, WeatherStationMarkerData } from '@/lib/supabase/types';
import LocationCard, { LocationCardAll } from '../LocationCards';
import StationDataTable from '../StationDataTable';

interface ParaglidingInfoWindowProps {
  location: ParaglidingMarkerData;
}

interface WeatherStationInfoWindowProps {
  location: WeatherStationMarkerData;
}

interface AllStartsInfoWindowProps {
  location: ParaglidingMarkerData;
}

export const ParaglidingInfoWindow: React.FC<ParaglidingInfoWindowProps> = ({ location }) => {
  return (
    <LocationCard
      location={location}
      timezone="Europe/Oslo"
    />
  );
};

export const WeatherStationInfoWindow: React.FC<WeatherStationInfoWindowProps> = ({ location }) => {
  return (
    <div className="p-4 max-w-md">
      {/* Station Header with Holfuy Link */}
      <div className="mb-4">
        <a
          href={`https://holfuy.com/en/weather/${location.station_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1"
        >
          <h3 className="font-bold gap-2 text-lg text-center text-[var(--accent)] hover:underline">
            🌤️{location.name} ({location.altitude}m)
          </h3>
        </a>
      </div>

      {/* Historical Data Table */}
      {location.station_data && location.station_data.length > 0 && (
        <div className="mt-4">
          <StationDataTable
            stationData={location.station_data}
            timezone="Europe/Oslo"
          />
        </div>
      )}
    </div>
  );
};

export const AllStartsInfoWindow: React.FC<AllStartsInfoWindowProps> = ({ location }) => {
  return (
    <LocationCardAll
      location={location}
    />
  );
};

export const getWeatherStationInfoWindow = (location: WeatherStationMarkerData) => {
  return <WeatherStationInfoWindow location={location} />;
};

export const getParaglidingInfoWindow = (location: ParaglidingMarkerData) => {
  return <ParaglidingInfoWindow location={location} />;
};

export const getAllStartsInfoWindow = (location: ParaglidingMarkerData) => {
  return <AllStartsInfoWindow location={location} />;
};