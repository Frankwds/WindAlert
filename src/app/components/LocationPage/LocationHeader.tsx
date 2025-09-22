'use client';

import { useState } from 'react';
import WindCompass from '../shared/windCompass';
import FavouriteHeart from '../shared/FavouriteHeart';
import { BackToMapButton, FlightlogButton, GoogleMapsButton, WindyButton, YrButton } from '../ExternalLinkButtons';

interface LocationHeaderProps {
  name: string;
  description: string;
  windDirections: string[];
  locationId: string;
  latitude: number;
  longitude: number;
  altitude: number;
  flightlog_id: string;
  isMain: boolean;
}

export default function LocationHeader({ name, description, windDirections, locationId, latitude, longitude, altitude, flightlog_id, isMain }: LocationHeaderProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="mb-4">
      <div className="flex gap-1 mb-4 mx-2 flex-wrap">
        <FavouriteHeart locationId={locationId} />
        <BackToMapButton latitude={latitude} longitude={longitude} isMain={isMain} />
        <FlightlogButton flightlogId={flightlog_id} />
        <YrButton latitude={latitude} longitude={longitude} />
        <WindyButton latitude={latitude} longitude={longitude} />
        <GoogleMapsButton latitude={latitude} longitude={longitude} />
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
        {description.length > 800 && (
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
