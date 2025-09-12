"use client";

import React from 'react';
import Link from 'next/link';
import { ParaglidingLocation, ParaglidingMarkerData } from '@/lib/supabase/types';
import MinimalHourlyWeather from './GoogleMaps/MinimalHourlyWeather';
import TinyWindCompass from './GoogleMaps/TinyWindCompass';
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
