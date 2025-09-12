"use client";

import React from 'react';
import Link from 'next/link';
import { ParaglidingLocation, ParaglidingMarkerData } from '@/lib/supabase/types';
import MinimalHourlyWeather from './GoogleMaps/MinimalHourlyWeather';
import TinyWindCompass from './GoogleMaps/TinyWindCompass';
import ExternalLinkIcon from './ExternalLinkIcon';
import { locationToWindDirectionSymbols } from '@/lib/utils/getWindDirection';

interface LocationCardProps {
  location: (ParaglidingLocation | ParaglidingMarkerData) & { forecast_cache?: any[] };
  timezone?: string;
}

export default function LocationCard({
  location,
  timezone = 'Europe/Oslo'
}: LocationCardProps) {
  const allowedDirections = locationToWindDirectionSymbols(location);

  return (
    <div>
      <Link
        href={`/locations/${location.id}`}
        rel="noopener noreferrer"
      >
        <div className="flex items-center mb-2">
          <TinyWindCompass allowedDirections={allowedDirections} />
          <h3 className="font-bold text-lg flex-1 text-center text-[var(--accent)] hover:underline">
            {location.name} ({location.altitude}m)
          </h3>
        </div>
      </Link>

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
      <div className="flex items-center mb-2 gap-4">
        <TinyWindCompass allowedDirections={allowedDirections} />
        {location.flightlog_id ? (
          <Link
            href={`https://flightlog.org/fl.html?l=1&country_id=160&a=22&start_id=${location.flightlog_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center flex-1 text-center hover:text-[var(--accent)] transition-colors duration-200"
            title="View on FlightLog.org"
          >
            <h3 className="font-bold text-lg flex-1 text-center text-[var(--accent)] hover:underline">
              {location.name} ({location.altitude}m)
            </h3>
            <ExternalLinkIcon size={16} className="ml-2 text-[var(--muted)]" />
          </Link>
        ) : (
          <h3
            className="font-bold text-lg flex-1 text-center text-[var(--foreground)] cursor-default"
            title="No FlightLog ID available"
          >
            {location.name} ({location.altitude}m)
          </h3>
        )}
      </div>
    </div>
  );
}