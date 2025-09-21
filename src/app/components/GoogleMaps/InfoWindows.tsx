import React from 'react';
import { ParaglidingLocationWithForecast, WeatherStationWithData } from '@/lib/supabase/types';
import LocationCard, { LocationCardAll } from '../LocationCards';
import StationDataTable from '../StationDataTable';

interface ParaglidingInfoWindowProps {
  location: ParaglidingLocationWithForecast;
}

interface WeatherStationInfoWindowProps {
  location: WeatherStationWithData;
}

interface AllStartsInfoWindowProps {
  location: ParaglidingLocationWithForecast;
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

export const getWeatherStationInfoWindow = (location: WeatherStationWithData) => {
  return <WeatherStationInfoWindow location={location} />;
};

export const getMainParaglidingInfoWindow = (location: ParaglidingLocationWithForecast) => {
  return <ParaglidingInfoWindow location={location} />;
};

export const getAllParaglidingInfoWindow = (location: ParaglidingLocationWithForecast) => {
  return <AllStartsInfoWindow location={location} />;
};

interface LandingInfoWindowProps {
  location: ParaglidingLocationWithForecast;
}

export const LandingInfoWindow: React.FC<LandingInfoWindowProps> = ({ location }) => {
  return (
    <div className="p-4 max-w-sm">
      <h3 className="font-bold text-lg text-center text-[var(--accent)]">
        🛬 {location.name} landing
      </h3>
      {location.landing_altitude && (
        <p className="text-center text-sm text-gray-600 mt-2">
          Altitude: {location.landing_altitude}m
        </p>
      )}
    </div>
  );
};

export const getLandingInfoWindow = (location: ParaglidingLocationWithForecast) => {
  return <LandingInfoWindow location={location} />;
};