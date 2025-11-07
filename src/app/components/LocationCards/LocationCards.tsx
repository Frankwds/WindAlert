'use client';

import React from 'react';
import Link from 'next/link';
import { ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import MinimalHourlyWeather from '@/app/components/LocationCards/MinimalHourlyWeather';
import TinyWindCompass from '@/app/components/GoogleMaps/TinyWindCompass';
import { locationToWindDirectionSymbols } from '@/lib/utils/getWindDirection';
import { CompactFlightlogButton, WindyButton, YrButton, GoogleMapsButton } from '@/app/components/ExternalLinkButtons';

interface LocationCardProps {
  location: ParaglidingLocationWithForecast;
  timezone: string;
}

export default function LocationCard({ location, timezone = 'Europe/Oslo' }: LocationCardProps) {
  const allowedDirections = locationToWindDirectionSymbols(location);

  return (
    <div className='min-w-50 max-w-90'>
      <div className='flex items-center'>
        <CompactFlightlogButton flightlogId={location.flightlog_id} />

        <Link href={`/locations/${location.flightlog_id}`} rel='noopener noreferrer' className='flex-1'>
          <h3 className='font-bold gap-2 text-lg text-center text-[var(--accent)] hover:underline'>{location.name}</h3>
        </Link>
        <TinyWindCompass allowedDirections={allowedDirections} />
      </div>
      {location.altitude ? <p className='text-center text-sm text-gray-600'>Høyde: {location.altitude}moh</p> : null}
      <hr className='mt-2 mb-4' />
      {location.forecast_cache && location.forecast_cache.length > 0 ? (
        <MinimalHourlyWeather forecast={location.forecast_cache} timezone={timezone} />
      ) : (
        <p className='mt-2 text-[var(--muted)]'>Ingen værmeldinger tilgjengelig.</p>
      )}
    </div>
  );
}

interface LocationCardAllProps {
  location: ParaglidingLocationWithForecast;
}

export function LocationCardAll({ location }: LocationCardAllProps) {
  const allowedDirections = locationToWindDirectionSymbols(location);

  return (
    <div className='min-w-50 max-w-90'>
      <div className='flex items-center'>
        <CompactFlightlogButton flightlogId={location.flightlog_id} />
        <Link href={`/locations/${location.flightlog_id}`} rel='noopener noreferrer' className='flex-1'>
          <h3 className='font-bold gap-2 text-lg text-center text-[var(--accent)] hover:underline'>{location.name}</h3>
        </Link>

        <TinyWindCompass allowedDirections={allowedDirections} />
      </div>
      {location.altitude ? <p className='text-center text-sm text-gray-600'>Høyde: {location.altitude}moh</p> : null}
      <hr className='mt-2 mb-4' />
      <div className='flex items-center gap-1 justify-center flex-wrap'>
        <YrButton latitude={location.latitude} longitude={location.longitude} />
        <WindyButton latitude={location.latitude} longitude={location.longitude} />
        <GoogleMapsButton latitude={location.latitude} longitude={location.longitude} />
      </div>
    </div>
  );
}
