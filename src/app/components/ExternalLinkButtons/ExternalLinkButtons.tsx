'use client';

import Link from 'next/link';
import { MapIcon, ArrowUturnLeftIcon } from '@heroicons/react/24/outline';
import { DocumentTextIcon, SunIcon } from '@heroicons/react/24/outline';
import { CloudIcon } from '@heroicons/react/24/solid';
import ExternalLinkIcon from './ExternalLinkIcon';
import { updateMapState } from '../../../lib/localstorage/mapStorage';

interface BackToMapButtonProps {
  latitude: number;
  longitude: number;
  isMain: boolean;
}

export function BackToMapButton({ latitude, longitude, isMain }: BackToMapButtonProps) {
  const handleMapLinkClick = () => {
    updateMapState({
      center: { lat: latitude, lng: longitude },
      zoom: 12,
    });
  };

  return (
    <Link
      href={isMain ? '/' : '/locations/all'}
      onClick={handleMapLinkClick}
      className='flex flex-1 items-center max-w-20 px-2 py-2 justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)] cursor-pointer'
      title='Find on Map'
    >
      <ArrowUturnLeftIcon className='w-4 h-4 flex-shrink-0 scale-y-[-1] ' />
      <span className='text-sm font-medium whitespace-nowrap'>Kart</span>
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
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center justify-center max-w-28 min-w-24 gap-1.5 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)]  hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)]  cursor-pointer flex-1 min-w-0'
      title='View on Windy.com'
    >
      <svg width={20} height={20} viewBox='0 0 122.88 74.78' fill='currentColor' className='w-5 h-5 flex-shrink-0'>
        <g>
          <path d='M28.69,53.38c-1.61,0-2.91-1.3-2.91-2.91c0-1.61,1.3-2.91,2.91-2.91h51.37c0.21,0,0.42,0.02,0.62,0.07 c1.84,0.28,3.56,0.8,5.1,1.63c1.7,0.92,3.15,2.19,4.27,3.89c3.85,5.83,3.28,11.24,0.56,15.24c-1.77,2.61-4.47,4.55-7.45,5.57 c-3,1.03-6.32,1.13-9.32,0.03c-4.54-1.66-8.22-5.89-8.76-13.55c-0.11-1.6,1.1-2.98,2.7-3.09c1.6-0.11,2.98,1.1,3.09,2.7 c0.35,4.94,2.41,7.56,4.94,8.48c1.71,0.62,3.67,0.54,5.48-0.08c1.84-0.63,3.48-1.79,4.52-3.32c1.49-2.19,1.71-5.28-0.61-8.79 c-0.57-0.86-1.31-1.51-2.18-1.98c-0.91-0.49-1.97-0.81-3.13-0.99H28.69L28.69,53.38z M15.41,27.21c-1.61,0-2.91-1.3-2.91-2.91 c0-1.61,1.3-2.91,2.91-2.91h51.21c1.17-0.18,2.23-0.5,3.14-0.99c0.87-0.47,1.61-1.12,2.18-1.98c2.32-3.51,2.09-6.6,0.61-8.79 c-1.04-1.53-2.68-2.69-4.52-3.32c-1.81-0.62-3.78-0.7-5.48-0.08c-2.52,0.92-4.59,3.54-4.94,8.48c-0.11,1.6-1.49,2.81-3.09,2.7 c-1.6-0.11-2.81-1.49-2.7-3.09c0.54-7.66,4.22-11.89,8.76-13.55c3-1.09,6.32-0.99,9.32,0.03c2.98,1.02,5.68,2.97,7.45,5.57 c2.72,4,3.29,9.41-0.56,15.24c-1.12,1.7-2.57,2.97-4.27,3.89c-1.54,0.83-3.26,1.35-5.1,1.63c-0.2,0.04-0.41,0.07-0.62,0.07H15.41 L15.41,27.21z M2.91,40.3C1.3,40.3,0,38.99,0,37.39c0-1.61,1.3-2.91,2.91-2.91h107.07c1.17-0.18,2.23-0.5,3.13-0.99 c0.87-0.47,1.61-1.12,2.18-1.98c2.32-3.51,2.09-6.6,0.61-8.79c-1.04-1.53-2.68-2.69-4.52-3.32c-1.81-0.62-3.78-0.7-5.48-0.08 c-2.52,0.92-4.59,3.54-4.94,8.48c-0.11,1.6-1.49,2.81-3.09,2.7c-1.6-0.11-2.81-1.49-2.7-3.09c0.54-7.66,4.22-11.89,8.76-13.55 c3-1.09,6.32-0.99,9.32,0.03c2.98,1.02,5.68,2.97,7.45,5.57c2.72,4,3.29,9.41-0.56,15.24c-1.12,1.7-2.57,2.97-4.27,3.89 c-1.54,0.83-3.26,1.35-5.1,1.63c-0.2,0.04-0.41,0.07-0.62,0.07H2.91L2.91,40.3z' />
        </g>
      </svg>

      <span className='text-sm font-medium whitespace-nowrap'>Windy</span>
      <ExternalLinkIcon className='w-4 h-4 flex-shrink-0' />
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
      target='_blank'
      rel='noopener noreferrer'
      className='flex flex-1 items-center max-w-24 min-w-20 justify-center gap-1.5 py-2.5 px-3 rounded-lg border border-[var(--border)] bg-[var(--background)]  hover:bg-[var(--border)] cursor-pointer '
      title='View on Yr.no'
    >
      <div className='flex flex-shrink-0'>
        <CloudIcon className='w-5 h-5' />
        <SunIcon className='w-5 h-5 ml-[-13px]' />
      </div>
      <span className='text-sm font-medium whitespace-nowrap'>Yr</span>
      <ExternalLinkIcon className='w-4 h-4 flex-shrink-0' />
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
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center justify-center max-w-36 min-w-28 gap-1.5 py-2.5 px-6 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)]  cursor-pointer flex-1 min-w-0'
      title='View on Flightlog.org'
    >
      <DocumentTextIcon className='w-5 h-5 flex-shrink-0' />
      <span className='text-sm font-medium whitespace-nowrap'>Flightlog</span>
      <ExternalLinkIcon className='w-4 h-4 flex-shrink-0' />
    </Link>
  );
}

interface CompactFlightlogButtonProps {
  flightlogId: string;
}

export function CompactFlightlogButton({ flightlogId }: CompactFlightlogButtonProps) {
  return (
    <Link
      href={`https://www.flightlog.org/fl.html?l=2&a=22&country_id=160&start_id=${flightlogId}`}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center row px-2 py-2 mr-2 rounded-lg border border-[var(--border)] bg-[var(--background)]  hover:bg-[var(--border)] cursor-pointer select-none'
      title='View on Flightlog.org'
    >
      <DocumentTextIcon className='w-5 h-5' />
      <ExternalLinkIcon className='w-2 h-2 mb-4 ml-[-7px]' />
    </Link>
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
      target='_blank'
      rel='noopener noreferrer'
      className='flex flex-1 items-center max-w-40 min-w-36 justify-center gap-1.5 px-3 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--background)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)] cursor-pointer flex-1 min-w-0'
      title='View on Google Maps'
    >
      <MapIcon className='w-5 h-5 flex-shrink-0' />
      <span className='text-sm font-medium whitespace-nowrap'>Google Maps</span>
      <ExternalLinkIcon className='w-4 h-4 flex-shrink-0' />
    </Link>
  );
}
