import React from 'react';
import { ParaglidingLocationWithForecast, WeatherStationWithData } from '@/lib/supabase/types';
import LocationCard, { LocationCardAll } from '../LocationCards/LocationCards';
import StationDataTable from './StationDataTable';
import LandingWeatherTable from './LandingWeatherTable';
import { GoogleMapsButton, YrButton } from '../ExternalLinkButtons';

interface ParaglidingInfoWindowProps {
  location: ParaglidingLocationWithForecast;
}

interface WeatherStationInfoWindowProps {
  location: WeatherStationWithData;
}

interface AllStartsInfoWindowProps {
  location: ParaglidingLocationWithForecast;
}

interface LandingInfoWindowProps {
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

export const LandingInfoWindow: React.FC<LandingInfoWindowProps> = ({ location }) => {
  return (
    <div className="p-4 max-w-sm">
      <h3 className="font-bold text-lg text-center">
        📍 {location.name} landing
      </h3>
      {location.landing_altitude && (
        <p className="text-center text-sm text-gray-600 my-2">
          Høyde: {location.landing_altitude}moh
        </p>
      )}

      {location.landing_latitude && location.landing_longitude && (
        <div className="flex gap-1 justify-center">
          <YrButton
            latitude={location.landing_latitude}
            longitude={location.landing_longitude}
          />
          <GoogleMapsButton
            latitude={location.landing_latitude}
            longitude={location.landing_longitude}
          />
        </div>
      )}
      <hr className="my-2" />
      {location.forecast_cache && location.forecast_cache.length > 0 && (
        <div className="mt-4">
          <LandingWeatherTable
            forecast={location.forecast_cache}
            timezone="Europe/Oslo"
          />
        </div>
      )}
      <p className="text-center text-sm text-gray-600 mt-2">
        Husk å les nøye om landingen og tillatelser før du flyr.
      </p>
    </div>
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

export const getLandingInfoWindow = (location: ParaglidingLocationWithForecast) => {
  return <LandingInfoWindow location={location} />;
};


