'use client';

import { useEffect, useState } from 'react';
import { notFound } from 'next/navigation';
import WeatherTable from '@/app/components/LocationPage/WeatherTable';
import GoogleMaps from '@/app/components/LocationPage/GoogleMapsStatic';
import WindyWidget from '@/app/components/LocationPage/windyWidget';
import LocationHeader from '@/app/components/LocationPage/LocationHeader';
import { Contribute } from '@/app/components/LocationPage/Contribute/Contribute';
import { ParaglidingLocationService } from '@/lib/supabase/paraglidingLocations';
import { fetchMeteoDataClient } from '@/lib/openMeteo/apiClient';
import { openMeteoResponseSchema } from '@/lib/openMeteo/zod';
import { mapOpenMeteoData } from '@/lib/openMeteo/mapping';
import { combineDataSources } from '@/app/api/cron/_lib/utils/combineData';
import { fetchYrDataClient } from '@/lib/yr/apiClient';
import { mapYrData } from '@/lib/yr/mapping';
import { locationToWindDirectionSymbols } from '@/lib/utils/getWindDirection';
import { DEFAULT_ALERT_RULE } from '@/app/api/cron/_lib/validate/alert-rules';
import { isGoodParaglidingCondition } from '@/app/api/cron/_lib/validate/validateDataPoint';
import { getSixHourSymbolsByDay } from '../utils/utils';
import { groupForecastByDay } from '../utils/utils';
import { LoadingSpinner } from '@/app/components/shared';
import { ParaglidingLocation, LocationPageForecast } from '@/lib/supabase/types';

interface Props {
  params: Promise<{ flightlog_id: string }>;
}

export default function LocationPage({ params }: Props) {
  const [location, setLocation] = useState<ParaglidingLocation | null>(null);
  const [groupedByDay, setGroupedByDay] = useState<Record<string, LocationPageForecast[]>>({});
  const [sixHourSymbolsByDay, setSixHourSymbolsByDay] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for landing coordinates that can be updated
  const [landingLatitude, setLandingLatitude] = useState<number | undefined>(undefined);
  const [landingLongitude, setLandingLongitude] = useState<number | undefined>(undefined);
  const [landingAltitude, setLandingAltitude] = useState<number | undefined>(undefined);

  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        const flightlogId = (await params).flightlog_id;

        const locationData = await ParaglidingLocationService.getByFlightlogId(flightlogId);
        if (!locationData) {
          notFound();
        }
        setLocation(locationData);

        // Initialize landing coordinates state
        setLandingLatitude(locationData.landing_latitude);
        setLandingLongitude(locationData.landing_longitude);
        setLandingAltitude(locationData.landing_altitude);

        // Fetch weather data
        const forecastData = await fetchMeteoDataClient(locationData.latitude, locationData.longitude);
        const validatedData = openMeteoResponseSchema.parse(forecastData);
        const meteoData = mapOpenMeteoData(validatedData);

        const yrTakeoffData = await fetchYrDataClient(locationData.latitude, locationData.longitude);
        const mappedYrTakeoffData = mapYrData(yrTakeoffData);

        const combinedData = combineDataSources(meteoData, mappedYrTakeoffData.weatherDataYrHourly);

        const cutoff = Date.now() - 60 * 60 * 1000; // include previous hour
        const filteredForecast = combinedData.filter(f => new Date(f.time).getTime() >= cutoff);

        // Add validation data to forecast
        const validatedForecast = filteredForecast.map(hour => {
          const validated = isGoodParaglidingCondition(
            { ...hour, location_id: locationData.id },
            DEFAULT_ALERT_RULE,
            locationToWindDirectionSymbols(locationData)
          );
          return validated;
        });

        const timezone = locationData.timezone || 'Europe/Oslo';
        const sixHourSymbols = getSixHourSymbolsByDay(mappedYrTakeoffData, timezone);
        const grouped = groupForecastByDay(validatedForecast, timezone);

        setSixHourSymbolsByDay(sixHourSymbols);
        setGroupedByDay(grouped);
      } catch (err) {
        console.error('Error loading location data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load location data');
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, [params]);

  if (loading) {
    return (
      <div className='py-4 flex justify-center items-center min-h-64'>
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className='py-4 flex justify-center items-center min-h-64'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold text-red-600 mb-2'>Error Loading Location</h2>
          <p className='text-gray-600'>{error}</p>
        </div>
      </div>
    );
  }

  if (!location) {
    return (
      <div className='py-4 flex justify-center items-center min-h-64'>
        <div className='text-center'>
          <h2 className='text-xl font-semibold text-gray-600'>Location Not Found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className='py-4'>
      <LocationHeader
        name={location.name}
        description={location.description || ''}
        windDirections={locationToWindDirectionSymbols(location)}
        locationId={location.id}
        latitude={location.latitude}
        longitude={location.longitude}
        altitude={location.altitude}
        flightlog_id={location.flightlog_id}
        isMain={location.is_main}
      />

      <WeatherTable
        groupedByDay={groupedByDay}
        sixHourSymbolsByDay={sixHourSymbolsByDay}
        location={location}
        showValidation={true}
        timezone={location.timezone || 'Europe/Oslo'}
      />

      <WindyWidget lat={location.latitude} long={location.longitude} />
      <GoogleMaps
        latitude={location.latitude}
        longitude={location.longitude}
        landing_latitude={landingLatitude}
        landing_longitude={landingLongitude}
      />

      <Contribute
        locationId={location.id}
        startId={location.flightlog_id}
        latitude={location.latitude}
        longitude={location.longitude}
        takeoffAltitude={location.altitude}
        landingLatitude={landingLatitude}
        landingLongitude={landingLongitude}
        landingAltitude={landingAltitude}
        is_main={location.is_main}
        onSave={(landingLat, landingLng, landingAltitude) => {
          // Update the state so GoogleMapsStatic reflects the changes
          setLandingLatitude(landingLat);
          setLandingLongitude(landingLng);
          setLandingAltitude(landingAltitude);
        }}
      />
    </div>
  );
}
