import React, { useEffect, useState } from 'react';
import Image from 'next/image';

interface GoogleMapsProps {
  latitude: number;
  longitude: number;
  landing_latitude?: number;
  landing_longitude?: number;
}

interface MapUrls {
  hybrid: string;
  terrain: string;
  googleMapsUrl: string;
}

const GoogleMaps: React.FC<GoogleMapsProps> = ({ latitude, longitude, landing_latitude, landing_longitude }) => {
  const [mapUrls, setMapUrls] = useState<MapUrls | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMapUrls = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          lat: latitude.toString(),
          lon: longitude.toString(),
        });

        if (landing_latitude && landing_longitude) {
          params.append('landingLat', landing_latitude.toString());
          params.append('landingLon', landing_longitude.toString());
        }

        const response = await fetch(`/api/static-map?${params}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch map URLs');
        }

        const data = await response.json();
        setMapUrls(data);
      } catch (err) {
        console.error('Error fetching map URLs:', err);
        setError(err instanceof Error ? err.message : 'Failed to load map');
      } finally {
        setLoading(false);
      }
    };

    fetchMapUrls();
  }, [latitude, longitude, landing_latitude, landing_longitude]);

  if (loading) {
    return (
      <div className='p-4 flex flex-col items-center'>
        <h4 className='text-lg font-bold mb-2 text-[var(--foreground)]'>Google Maps</h4>
        <div className='flex justify-center items-center min-h-[400px]'>
          <p className='text-[var(--foreground)]'>Loading map...</p>
        </div>
      </div>
    );
  }

  if (error || !mapUrls) {
    return (
      <div className='p-4 flex flex-col items-center'>
        <h4 className='text-lg font-bold mb-2 text-[var(--foreground)]'>Google Maps</h4>
        <div className='flex justify-center items-center min-h-[400px]'>
          <p className='text-red-600'>{error || 'Failed to load map'}</p>
        </div>
      </div>
    );
  }

  return (
    <div className='p-4 flex flex-col items-center'>
      <h4 className='text-lg font-bold mb-2 text-[var(--foreground)]'>Google Maps</h4>
      <div className='flex gap-4 flex-wrap justify-center'>
        <Image
          width={640}
          height={640}
          className='w-full h-auto max-w-[400px] rounded-lg shadow-[var(--shadow-lg)]'
          src={mapUrls.hybrid}
          alt='Map showing location'
          unoptimized // Required for dynamic URLs
          priority
        />
        <Image
          width={640}
          height={640}
          className='w-full h-auto max-w-[400px] rounded-lg shadow-[var(--shadow-lg)]'
          src={mapUrls.terrain}
          alt='Map showing location'
          unoptimized // Required for dynamic URLs
          priority
        />
      </div>
    </div>
  );
};

export default GoogleMaps;
