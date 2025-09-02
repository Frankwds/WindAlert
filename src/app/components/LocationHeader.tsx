'use client';

import { useState } from 'react';
import Link from 'next/link';
import WindCompass from './windCompass';
import { MapIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import FavouriteHeart from './FavouriteHeart';
import ExternalLinkIcon from './ExternalLinkIcon';

interface LocationHeaderProps {
  name: string;
  description: string;
  windDirections: string[];
  locationId: string;
  latitude: number;
  longitude: number;
  altitude: number;
  flightlog_id?: string | null;
}

export default function LocationHeader({ name, description, windDirections, locationId, latitude, longitude, altitude, flightlog_id }: LocationHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleMapLinkClick = () => {
    // Get existing map state to preserve filters and other settings
    const existingState = localStorage.getItem('windlordMapState');
    let mapState = {};

    if (existingState) {
      try {
        mapState = JSON.parse(existingState);
      } catch (e) {
        console.error('Could not parse existing map state', e);
      }
    }

    // Update only center and zoom, preserve everything else
    const updatedState = {
      ...mapState,
      center: { lat: latitude, lng: longitude },
      zoom: 12 // Set a reasonable zoom level for location view
    };

    localStorage.setItem('windlordMapState', JSON.stringify(updatedState));
  };

  return (
    <div className="mb-4">
      {/* Action buttons above header */}
      <div className="flex gap-3 mb-4">
        <FavouriteHeart locationId={locationId} />
        <Link
          href="/"
          onClick={handleMapLinkClick}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)] transition-all duration-200 cursor-pointer"
          title="Find on Map"
        >
          <MapIcon className="w-4 h-4" />
          <span className="text-sm font-medium">Kart</span>
        </Link>

        {flightlog_id && (
          <a
            href={`https://www.flightlog.org/fl.html?l=2&a=22&country_id=160&start_id=${flightlog_id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:bg-[var(--border)] hover:shadow-[var(--shadow-hover)] transition-all duration-200 cursor-pointer"
            title="View on Flightlog.org"
          >
            <DocumentTextIcon className="w-4 h-4" />
            <span className="text-sm font-medium">Flightlog</span>
            <ExternalLinkIcon className="w-4 h-4" />
          </a>
        )}
      </div>


      <h1 className="text-2xl font-bold ml-2 mb-4">{name} ({altitude}m)</h1>

      <div className="w-32 h-32 md:w-48 md:h-48 mb-4 float-right">
        <WindCompass allowedDirections={windDirections} />
      </div>
      <div className="relative">
        <div
          className={`break-words break-long transition-all duration-300 ${isExpanded ? 'max-h-none' : 'max-h-38 md:max-h-56 overflow-hidden'
            }`}
          dangerouslySetInnerHTML={{ __html: description }}
        />
        {description.length > 400 && (
          <div className={`cursor-pointer relative ${isExpanded ? 'hidden' : 'block'}`} onClick={() => setIsExpanded(true)}>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[var(--background)] to-transparent" />
            <button
              onClick={() => setIsExpanded(true)}
              className="absolute bottom-0 right-15 h-8 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium px-2"
            >
              ...Vis alt &rarr;
            </button>
          </div>
        )}
        {isExpanded && (
          <button
            onClick={() => {
              setIsExpanded(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="w-full text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium mt-2 py-2 flex items-center justify-center"
          >
            &larr; Vis mindre
          </button>
        )}
      </div>
    </div>
  );
}
