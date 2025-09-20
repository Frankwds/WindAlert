"use client";

import React from 'react';
import Link from 'next/link';
import { ParaglidingMarkerData } from '@/lib/supabase/types';
import MinimalHourlyWeather from './GoogleMaps/MinimalHourlyWeather';
import TinyWindCompass from './GoogleMaps/TinyWindCompass';
import { locationToWindDirectionSymbols } from '@/lib/utils/getWindDirection';
import { CompactFlightlogButton, WindyButton, YrButton, FlightlogButton } from './externalLinkButtons';

interface LocationCardProps {
  location: ParaglidingMarkerData;
  timezone: string;
}

export default function LocationCard({
  location,
  timezone = 'Europe/Oslo'
}: LocationCardProps) {
  const allowedDirections = locationToWindDirectionSymbols(location);

  return (
    <div>
      <div className="flex items-center  mb-2">
        <CompactFlightlogButton flightlogId={location.flightlog_id} />

        <Link
          href={`/locations/${location.id}`}
          rel="noopener noreferrer"
          className="flex-1"
        >
          <h3 className="font-bold gap-2 text-lg text-center text-[var(--accent)] hover:underline">
            {location.name} ({location.altitude}m)
          </h3>

        </Link>
        <TinyWindCompass allowedDirections={allowedDirections} />


      </div>
      {location.forecast_cache && location.forecast_cache.length > 0 ? (
        <MinimalHourlyWeather
          forecast={location.forecast_cache}
          timezone={timezone}
        />
      ) : (
        <p className="mt-2 text-[var(--muted)]">Ingen værmeldinger tilgjengelig.</p>
      )}
    </div>
  );
}

interface LocationCardAllProps {
  location: ParaglidingMarkerData;
}

export function LocationCardAll({ location }: LocationCardAllProps) {
  const allowedDirections = locationToWindDirectionSymbols(location);

  return (
    <div className="p-4 min-w-[200px]">
      <div className="flex items-center mb-2 gap-2">
        <TinyWindCompass allowedDirections={allowedDirections} />
        <h3 className="font-bold text-lg flex-1 text-center">
          {location.name} ({location.altitude}m)
        </h3>

      </div>

      <div className="flex items-center gap-1 justify-center flex-wrap">
        <WindyButton latitude={location.latitude} longitude={location.longitude} />
        <YrButton latitude={location.latitude} longitude={location.longitude} />
        <FlightlogButton flightlogId={location.flightlog_id} />
      </div>
    </div>
  );
}