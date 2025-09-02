'use client';

import { useState } from 'react';
import Link from 'next/link';
import WindCompass from './windCompass';
import { MapIcon, } from '@heroicons/react/24/outline';
import { MapPinIcon } from '@heroicons/react/24/solid';
import FavouriteHeart from './FavouriteHeart';

interface LocationHeaderProps {
  name: string;
  description: string;
  windDirections: string[];
  locationId: string;
  latitude: number;
  longitude: number;
}

export default function LocationHeader({ name, description, windDirections, locationId, latitude, longitude }: LocationHeaderProps) {
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
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FavouriteStar locationId={locationId} />
          <h1 className="text-2xl font-bold ml-2">{name}</h1>
        </div>
        <Link href="/" onClick={handleMapLinkClick} className="cursor-pointer transition-all duration-200 hover:bg-[var(--border)] rounded-lg p-2 mr-10" title="Find on Map">
          <MapPinIcon className="w-6 h-6" />
          <MapIcon className="w-6 h-6 mt-[-12px]" />
        </Link>
      </div>
      <h1 className="text-2xl font-bold mb-4">{name}</h1>
      <FavouriteHeart locationId={locationId} />
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
          <div className={`relative ${isExpanded ? 'hidden' : 'block'}`}>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white to-transparent dark:from-gray-900 dark:to-transparent" />
            <button
              onClick={() => setIsExpanded(true)}
              className="absolute bottom-0 left-0 right-0 h-8 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium flex items-center justify-center"
            >
              Show more
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
            Show less
          </button>
        )}
      </div>
    </div>
  );
}
