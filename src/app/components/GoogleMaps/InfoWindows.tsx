import React, { useState, useEffect } from 'react';
import { ParaglidingLocationWithForecast, WeatherStationWithLatestData, StationData } from '@/lib/supabase/types';
import LocationCard, { LocationCardAll } from '../LocationCards/LocationCards';
import StationDataTable from './StationDataTable';
import LandingWeatherTable from './LandingWeatherTable';
import { GoogleMapsButton, YrButton } from '../ExternalLinkButtons';
import { StationDataService } from '@/lib/supabase/stationData';

interface ParaglidingInfoWindowProps {
  location: ParaglidingLocationWithForecast;
}

interface WeatherStationInfoWindowProps {
  location: WeatherStationWithLatestData;
}

interface AllStartsInfoWindowProps {
  location: ParaglidingLocationWithForecast;
}

interface LandingInfoWindowProps {
  location: ParaglidingLocationWithForecast;
}

interface MapClickLinksInfoWindowProps {
  latitude: number;
  longitude: number;
}

const getWeatherStationUrl = ({ provider, station_id }: Pick<WeatherStationWithLatestData, 'provider' | 'station_id'>) => {
  switch (provider) {
    case 'Holfuy':
      return `https://holfuy.com/en/weather/${station_id}`;
    case 'PortWind':
      return `https://portwind.no/#${station_id}`;
    default:
      return 'https://seklima.met.no/stations/';
  }
};

export const ParaglidingInfoWindow: React.FC<ParaglidingInfoWindowProps> = ({ location }) => {
  return <LocationCard location={location} timezone={location.timezone} />;
};

export const WeatherStationInfoWindow: React.FC<WeatherStationInfoWindowProps> = ({ location }) => {
  const [historicalData, setHistoricalData] = useState<StationData[]>([]);
  const [isLoadingHistorical, setIsLoadingHistorical] = useState(true);
  const [historicalError, setHistoricalError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistoricalData = async () => {
      try {
        setIsLoadingHistorical(true);
        setHistoricalError(null);
        const data = await StationDataService.getStationDataByStationId(location.station_id);
        setHistoricalData(data);
      } catch (error) {
        console.error('Error fetching historical data:', error);
        setHistoricalError('Failed to load historical data');
      } finally {
        setIsLoadingHistorical(false);
      }
    };

    fetchHistoricalData();
  }, [location.station_id]);

  return (
    <div className='p-4 max-w-md'>
      <div className='mb-4'>
        <div className='flex flex-col items-center'>
          <a
            href={getWeatherStationUrl(location)}
            target='_blank'
            rel='noopener noreferrer'
            className='flex-1'
          >
            <h3 className='font-bold gap-2 text-lg text-center text-[var(--accent)] hover:underline'>
              🌤️{location.name}({location.provider})
            </h3>
            {location.altitude && <p className='text-center text-sm text-gray-600'>Høyde: {location.altitude}moh</p>}
          </a>
        </div>
      </div>

      {/* Historical Data Table */}
      <div className='mt-4'>
        {isLoadingHistorical ? (
          <div className='text-center py-4'>
            <div className='text-sm text-gray-600'>Loading historical data...</div>
          </div>
        ) : historicalError ? (
          <div className='text-center py-4'>
            <div className='text-sm text-red-600'>{historicalError}</div>
          </div>
        ) : historicalData.length > 0 ? (
          <StationDataTable stationData={historicalData} timezone='Europe/Oslo' />
        ) : (
          <div className='text-center py-4'>
            <div className='text-sm text-gray-600'>No historical data available</div>
          </div>
        )}
      </div>
    </div>
  );
};

export const AllStartsInfoWindow: React.FC<AllStartsInfoWindowProps> = ({ location }) => {
  return <LocationCardAll location={location} />;
};

export const LandingInfoWindow: React.FC<LandingInfoWindowProps> = ({ location }) => {
  return (
    <div className='p-4 max-w-sm'>
      <h3 className='font-bold text-lg text-center'>📍 {location.name} landing</h3>
      {location.landing_altitude && (
        <p className='text-center text-sm text-gray-600 my-2'>Høyde: {location.landing_altitude}moh</p>
      )}

      {location.landing_latitude && location.landing_longitude && (
        <div className='flex gap-1 justify-center'>
          <YrButton latitude={location.landing_latitude} longitude={location.landing_longitude} />
          <GoogleMapsButton latitude={location.landing_latitude} longitude={location.landing_longitude} />
        </div>
      )}
      <hr className='my-2' />
      {location.forecast_cache && location.forecast_cache.length > 0 && (
        <div className='mt-4'>
          <LandingWeatherTable forecast={location.forecast_cache} timezone='Europe/Oslo' />
        </div>
      )}
      <p className='text-center text-sm text-gray-600 mt-2'>Husk å les nøye om landingen og tillatelser før du flyr.</p>
    </div>
  );
};

export const MapClickLinksInfoWindow: React.FC<MapClickLinksInfoWindowProps> = ({ latitude, longitude }) => {
  return (
    <div className='map-click-links-infowindow pl-1.5 pt-[11px] pr-[30px] pb-[8px]'>
      <div className='flex gap-2 items-start justify-center pl-4'>
        <div className='flex flex-col items-center gap-1'>
          <YrButton latitude={latitude} longitude={longitude} iconOnly />
          <span className='text-[10px] leading-none text-[var(--foreground)]/70'>Yr</span>
        </div>
        <div className='flex flex-col items-center gap-1'>
          <GoogleMapsButton latitude={latitude} longitude={longitude} iconOnly />
          <span className='text-[10px] leading-none text-[var(--foreground)]/70'>Kart</span>
        </div>
      </div>
    </div>
  );
};

export const getWeatherStationInfoWindow = (location: WeatherStationWithLatestData) => {
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

export const getMapClickLinksInfoWindow = (latitude: number, longitude: number) => {
  return <MapClickLinksInfoWindow latitude={latitude} longitude={longitude} />;
};
