'use client';

import Link from 'next/link';
import { MapIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon, SunIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { CloudIcon } from '@heroicons/react/24/solid';
import ExternalLinkIcon from '../ExternalLinkIcon';
import { updateMapState } from '../../../lib/localstorage/mapStorage';

interface BackToMapButtonProps {
  latitude: number;
  longitude: number;
}

export function BackToMapButton({ latitude, longitude }: BackToMapButtonProps) {
  const handleMapLinkClick = () => {
    updateMapState({
      center: { lat: latitude, lng: longitude },
      zoom: 12
    });
  };

  return (
    <Link
      href="/"
      onClick={handleMapLinkClick}
      className="flex flex-1 items-center max-w-18 px-1 justify-center gap-1 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)] cursor-pointer"
      title="Find on Map"
    >
      <ArrowUturnLeftIcon className="w-3 h-3 flex-shrink-0 scale-y-[-1] " />
      <span className="text-xs font-medium whitespace-nowrap">Kart</span>
      {/* <MapIcon className="w-4 h-4 flex-shrink-0" /> */}
    </Link>
  );
}

interface WindyButtonProps {
  latitude: number;
  longitude: number;
}

export function WindyButton({ latitude, longitude }: WindyButtonProps) {
  return (
    <Link
      href={`https://www.windy.com/${latitude.toFixed(3)}/${longitude.toFixed(3)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center max-w-24 min-w-20 gap-1 px-2 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)]  hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)]  cursor-pointer flex-1 min-w-0"
      title="View on Windy.com"
    >
      <ArrowPathIcon className="w-4 h-4 flex-shrink-0" />
      <span className="text-xs font-medium whitespace-nowrap">Windy</span>
      <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
    </Link>
  );
}

interface YrButtonProps {
  latitude: number;
  longitude: number;
}

export function YrButton({ latitude, longitude }: YrButtonProps) {
  return (
    <Link
      href={`https://www.yr.no/nb/værvarsel/daglig-tabell/${latitude.toFixed(3)},${longitude.toFixed(3)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 items-center max-w-20 min-w-16 justify-center gap-1 py-2 px-2 rounded-lg border border-[var(--border)] bg-[var(--background)]  hover:bg-[var(--border)] cursor-pointer "
      title="View on Yr.no"
    >
      <div className="flex flex-shrink-0">
        <CloudIcon className="w-4 h-4" />
        <SunIcon className="w-4 h-4 ml-[-11px]" />
      </div>
      <span className="text-xs font-medium whitespace-nowrap">Yr</span>
      <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
    </Link>
  );
}

interface FlightlogButtonProps {
  flightlogId: string;
}

export function FlightlogButton({ flightlogId }: FlightlogButtonProps) {
  return (
    <Link
      href={`https://www.flightlog.org/fl.html?l=2&a=22&country_id=160&start_id=${flightlogId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center max-w-30 min-w-24 gap-1 py-2 px-5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)]  cursor-pointer flex-1 min-w-0"
      title="View on Flightlog.org"
    >
      <DocumentTextIcon className="w-4 h-4 flex-shrink-0" />
      <span className="text-xs font-medium whitespace-nowrap">Flightlog</span>
      <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
    </Link>
  );
}

interface CompactFlightlogButtonProps {
  flightlogId: string;
}


export function CompactFlightlogButton({ flightlogId }: CompactFlightlogButtonProps) {
  return (
    <a
      href={`https://www.flightlog.org/fl.html?l=2&a=22&country_id=160&start_id=${flightlogId}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center row px-2 py-2 mr-2 rounded-lg border border-[var(--border)] bg-[var(--background)]  hover:bg-[var(--border)] cursor-pointer"
      title="View on Flightlog.org"
    >
      <DocumentTextIcon className="w-5 h-5" />
      <ExternalLinkIcon className="w-2 h-2 mb-4 ml-[-7px]" />
    </a>
  );
}

interface GoogleMapsButtonProps {
  latitude: number;
  longitude: number;
}

export function GoogleMapsButton({ latitude, longitude }: GoogleMapsButtonProps) {
  const googleMapsUrl = `https://maps.google.com/?q=${latitude},${longitude}&z=12&t=k`;

  return (
    <Link
      href={googleMapsUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex flex-1 items-center max-w-32 min-w-28 justify-center gap-1 px-2 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)] cursor-pointer flex-1 min-w-0"
      title="View on Google Maps"
    >
      <MapIcon className="w-4 h-4 flex-shrink-0" />
      <span className="text-xs font-medium whitespace-nowrap">Google Maps</span>
      <ExternalLinkIcon className="w-3 h-3 flex-shrink-0" />
    </Link>
  );
}