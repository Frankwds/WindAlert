'use client';

import React, { useState, useCallback } from 'react';
import Collapsible from '../../shared/Collapsible';
import { ButtonAccept } from '../../shared';
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

      // Update the cache - this will add/remove from main cache based on is_main
      try {
        await dataCache.updateLocationIsMain(updatedLocation as ParaglidingLocationWithForecast);
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

  const title = is_main ? 'Skjul fra hovedstarter' : 'Legg til i hovedstarter';
  const buttonText = is_main ? 'Skjul fra hovedstarter' : 'Sett som hovedstart';
  const loadingText = is_main ? 'Skjuler...' : 'Legger til...';
  const description = is_main
    ? 'Denne starten er en hovedstart og vises i kartet på forsiden. Hvis du skjuler den, vises den kun på «Alle starter»-kartet for alle som bruker WindLord.'
    : 'Denne starten er skjult fra hovedstarter. Hvis du setter den som hovedstart, vises den i kartet på forsiden for alle som bruker WindLord.';

  return (
    <div className='mt-4'>
      <Collapsible title={title} className='bg-[var(--card)] border border-[var(--border)] rounded-lg'>
        <div className='space-y-4 px-3'>
          <p className='text-sm text-[var(--foreground)]'>{description}</p>

          {!user && !authLoading ? (
            <div className='space-y-3 p-4 bg-[var(--card)] border border-[var(--border)] rounded-lg'>
              <p className='text-sm text-[var(--foreground)] text-center'>Du må være innlogget for å bidra</p>
              <div className='flex justify-center'>
                <LoginButton variant='content' />
              </div>
            </div>
          ) : (
            <ButtonAccept
              onClick={handleToggle}
              title={isToggling ? loadingText : buttonText}
              disabled={isToggling || !user || authLoading}
            />
          )}

          {toggleError && <div className='text-sm text-[var(--error)]'>{toggleError}</div>}
        </div>
      </Collapsible>
    </div>
  );
};
