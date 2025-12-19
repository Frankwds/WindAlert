'use client';

import React, { useState, useCallback } from 'react';
import { dataCache } from '@/lib/data-cache';
import { ParaglidingLocation, ParaglidingLocationWithForecast } from '@/lib/supabase/types';
import { useAuth } from '@/contexts/AuthContext';
import LoginButton from '../../Navigation/LoginButton';
import { supabase } from '@/lib/supabase/client';

interface ContributeToggleMainProps {
  locationId: string;
  is_main: boolean;
}

export const ContributeToggleMain: React.FC<ContributeToggleMainProps> = ({ locationId, is_main }) => {
  const [toggleError, setToggleError] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState(false);
  const { user, loading: authLoading } = useAuth();

  const handleToggle = useCallback(async () => {
    if (!user) {
      alert('Du må være innlogget for å bidra');
      return;
    }

    const newIsMain = !is_main;
    const confirmationMessage = newIsMain
      ? 'Er du sikker på at du vil sette dette som hovedstart? Dette vil påvirke alle som bruker windlord.'
      : 'Er du sikker på at du vil skjule denne fra hovedstarter? Dette vil påvirke alle som bruker windlord.';

    const confirmed = confirm(confirmationMessage);

    if (!confirmed) {
      return;
    }

    setIsToggling(true);
    setToggleError(null);

    try {
      // Get the session token to pass in Authorization header
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const authToken = session?.access_token;

      if (!authToken) {
        setToggleError('Du må være innlogget for å bidra. Vennligst logg inn og prøv igjen.');
        setIsToggling(false);
        return;
      }

      const response = await fetch('/api/contribute/is-main', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          locationId,
          is_main: newIsMain,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setToggleError(errorData.error || 'Failed to toggle location status');
        return;
      }

      // Get the updated location data
      const responseData = await response.json();
      const updatedLocation: ParaglidingLocation = responseData.location;

      // Update the cache with the new location data (without forecast)
      try {
        await dataCache.updateParaglidingLocationById(
          updatedLocation.id,
          updatedLocation as ParaglidingLocationWithForecast
        );
      } catch (cacheError) {
        console.warn('Failed to update cache:', cacheError);
        // Fall back to clearing cache
        await dataCache.clearCache();
      }

      // Success - show alert and reload the page
      alert('Takk for bidraget!');
      window.location.reload();
    } catch (error) {
      console.error('Error toggling location status:', error);
      setToggleError('Det skjedde en feil ved endring av stedets status. Prøv igjen senere.');
    } finally {
      setIsToggling(false);
    }
  }, [locationId, is_main, user]);

  const buttonText = is_main ? 'Skjul fra hovedstarter' : 'Sett som hovedstart';
  const loadingText = is_main ? 'Nedgraderer...' : 'Oppgraderer...';

  if (!user && !authLoading) {
    return (
      <div className='mt-4'>
        <div className='rounded-lg p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg'>
          <p className='text-sm text-[var(--foreground)] text-center mb-3'>Du må være innlogget for å bidra</p>
          <div className='flex justify-center'>
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='mt-4'>
      <div className='rounded-lg'>
        <button
          onClick={handleToggle}
          disabled={isToggling || !user}
          className='w-full text-left p-4 focus:outline-none cursor-pointer hover:shadow-[var(--shadow-sm)] hover:brightness-95 relative group bg-[var(--card)] border border-[var(--border)] rounded-lg disabled:opacity-50 disabled:cursor-not-allowed'
        >
          <div className='flex items-center w-full relative z-10'>
            <div className='flex items-center flex-1'>
              {isToggling ? (
                <>
                  <div className='w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2'></div>
                  {loadingText}
                </>
              ) : (
                <>{buttonText}</>
              )}
            </div>

            <div className='text-[var(--muted)] flex-shrink-0 ml-2'>
              <svg className='w-4 h-4 mr-2' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                {is_main ? (
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 14l-7 7m0 0l-7-7m7 7V3' />
                ) : (
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M5 10l7-7m0 0l7 7m-7-7v18' />
                )}
              </svg>
            </div>
          </div>
          <div className='absolute inset-0 bg-current opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none rounded-lg'></div>
        </button>
      </div>

      {toggleError && <div className='mt-2 text-sm text-[var(--error)] text-center'>{toggleError}</div>}
    </div>
  );
};
