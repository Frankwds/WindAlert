"use client";

import React from 'react';
import Link from 'next/link';
import { ParaglidingMarkerData } from '@/lib/supabase/types';
import MinimalHourlyWeather from './GoogleMaps/MinimalHourlyWeather';
import TinyWindCompass from './GoogleMaps/TinyWindCompass';
import ExternalLinkIcon from './ExternalLinkIcon';
import { locationToWindDirectionSymbols } from '@/lib/utils/getWindDirection';
import { DocumentTextIcon, SunIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CloudIcon } from '@heroicons/react/24/solid';

interface LocationCardProps {
  location: ParaglidingMarkerData;
  timezone?: string;
}

export default function LocationCard({
  location,
  timezone = 'Europe/Oslo'
}: LocationCardProps) {
  const allowedDirections = locationToWindDirectionSymbols(location);

  return (
    <div>
      <div className="flex items-center  mb-2">
        <a
          href={`https://www.flightlog.org/fl.html?l=2&a=22&country_id=160&start_id=${location.flightlog_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center row px-2 py-2 mx-1 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)]  cursor-pointer"
          title="View on Flightlog.org"
        >
          <DocumentTextIcon className="w-5 h-5" />
          <ExternalLinkIcon className="w-2 h-2 mb-4 ml-[-7px]" />
        </a>

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
        <Link
          href={`https://www.windy.com/${location.latitude.toFixed(3)}/${location.longitude.toFixed(3)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 px-2 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)] transition-all duration-200 cursor-pointer flex-1 min-w-0"
          title="View on Windy.com"
        >
          <ArrowPathIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-medium whitespace-nowrap">Windy</span>
          <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
        </Link>
        <Link
          href={`https://www.yr.no/nb/værvarsel/daglig-tabell/${location.latitude.toFixed(3)},${location.longitude.toFixed(3)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1  py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)] transition-all duration-200 cursor-pointer flex-1 min-w-0"
          title="View on Yr.no"
        >
          <div className="flex flex-shrink-0">
            <CloudIcon className="w-4 h-4" />
            <SunIcon className="w-4 h-4 ml-[-11px]" />
          </div>
          <span className="text-xs font-medium whitespace-nowrap">Yr</span>
          <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
        </Link>
        <Link
          href={`https://www.flightlog.org/fl.html?l=2&a=22&country_id=160&start_id=${location.flightlog_id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-1 py-2 px-5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)] transition-all duration-200 cursor-pointer flex-1 min-w-0"
          title="View on Flightlog.org"
        >
          <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
          <span className="text-xs font-medium whitespace-nowrap">Flightlog</span>
          <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
        </Link>
      </div>
    </div>
  );
}