'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';

interface MapLayerToggleProps {
  map: google.maps.Map | null;
  className?: string;
}

export const MapLayerToggle: React.FC<MapLayerToggleProps> = ({ map, className = '' }) => {
  const [isSatellite, setIsSatellite] = useState(true);

  useEffect(() => {
    if (map) {
      // Set initial state
      setIsSatellite(map.getMapTypeId() === google.maps.MapTypeId.HYBRID);
    }
  }, [map]);

  const handleToggle = () => {
    if (!map) return;

    const newMapType = isSatellite
      ? google.maps.MapTypeId.TERRAIN
      : google.maps.MapTypeId.HYBRID;

    map.setMapTypeId(newMapType);
    setIsSatellite(!isSatellite);
  };

  if (!map) return null;

  return (
    <div className={`absolute bottom-3 left-3 z-10 ${className}`}>
      <div className="flex gap-2">
        <button
          onClick={handleToggle}
          className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${!isSatellite ? 'ring-2 ring-[var(--accent)] shadow-[var(--shadow-lg)]' : 'opacity-70 hover:opacity-100'
            }`}
          style={{ display: isSatellite ? 'none' : 'block' }}
        >
          <Image
            src="/satellite.png"
            alt="Satellite"
            fill
            sizes="64px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold">Satellite</span>
          </div>
        </button>

        {/* Terrain Button - Shows when Satellite is active */}
        <button
          onClick={handleToggle}
          className={`relative w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:ring-offset-2 focus:ring-offset-[var(--background)] ${isSatellite ? 'ring-2 ring-[var(--accent)] shadow-[var(--shadow-lg)]' : 'opacity-70 hover:opacity-100'
            }`}
          style={{ display: isSatellite ? 'block' : 'none' }}
        >
          <Image
            src="/terrain.png"
            alt="Terrain"
            fill
            sizes="64px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold">Terrain</span>
          </div>
        </button>
      </div>
    </div>
  );
};
