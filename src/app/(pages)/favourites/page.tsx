'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FavouriteLocationService } from '@/lib/supabase/favouriteLocations';
import { ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import LocationCard, { LocationCardAll } from '@/app/components/LocationCards/LocationCards';

export default function FavouritesPage() {
  const { user, loading: authLoading } = useAuth();
  const [locations, setLocations] = useState<ParaglidingLocationWithForecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      setError(null);

      FavouriteLocationService.getAllForUserWithForecast(user.id)
        .then(favs => {
          setLocations(favs);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch favourites:', err);
          setError('Kunne ikke laste favoritter');
          setLoading(false);
        });
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [user, authLoading]);

  if (loading || authLoading) {
    return (
      <main className='flex min-h-screen flex-col items-center p-8'>
        <div className='z-10 w-full max-w-5xl'>
          <h1 className='text-4xl font-bold mb-8 text-center'>Favoritter</h1>
          <p>Laster...</p>
        </div>
      </main>
    );
  }

  if (!user) {
    return (
      <main className='flex min-h-screen flex-col items-center p-8'>
        <div className='z-10 w-full max-w-5xl'>
          <h1 className='text-4xl font-bold mb-8 text-center'>Favoritter</h1>
          <p>Vennligst logg inn for å se dine favorittsteder.</p>
        </div>
      </main>
    );
  }

  return (
    <main className='flex min-h-screen flex-col items-center p-8'>
      <div className='z-10 w-full max-w-5xl'>
        <h1 className='text-4xl font-bold mb-8 text-center'>Favoritter</h1>
        {locations.length > 0 ? (
          <div className='flex flex-wrap gap-4 justify-center '>
            {locations.map(location => (
              <div
                key={location.id}
                className='bg-[var(--background)] rounded-lg shadow-[var(--shadow-lg)] p-4 sm:p-6 border border-[var(--border)] w-full max-w-sm sm:w-[calc(50%-0.5rem)] flex-shrink-0'
              >
                {location.is_main ? (
                  <LocationCard location={location} timezone='Europe/Oslo' />
                ) : (
                  <LocationCardAll location={location} />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p>Du har ingen favorittsteder enda.</p>
        )}
      </div>
    </main>
  );
}
