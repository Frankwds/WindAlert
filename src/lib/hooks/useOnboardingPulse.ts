'use client';

import { useState, useEffect, useRef } from 'react';
import { getOnboardingInteractions } from '@/lib/localstorage/onboardingStorage';

type ControlName = 'FilterControl' | 'PromisingFilter' | 'WindFilterCompass';

const SEQUENCE: ControlName[] = ['FilterControl', 'PromisingFilter', 'WindFilterCompass'];
const POLL_INTERVAL = 500; // 500ms
const DELAY_MS = 5000; // 5 seconds

// Map control names to interaction keys
const getInteractionKey = (control: ControlName): keyof ReturnType<typeof getOnboardingInteractions> => {
  switch (control) {
    case 'FilterControl':
      return 'hasInteractedWithFilterControl';
    case 'PromisingFilter':
      return 'hasInteractedWithPromisingFilter';
    case 'WindFilterCompass':
      return 'hasInteractedWithWindFilterCompass';
  }
};

/**
 * Hook to determine if a control should pulse for onboarding.
 * Pulses controls in sequence: FilterControl → PromisingFilter → WindFilterCompass
 * Only pulses after 5 seconds from page load, and only if the control hasn't been interacted with.
 * Stops polling once the current control has been interacted with.
 */
export const useOnboardingPulse = (controlName: ControlName): boolean => {
  const [shouldPulse, setShouldPulse] = useState(false);
  const pageLoadTimeRef = useRef<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // SSR safety check
    if (typeof window === 'undefined') return;

    // Record page load time on first mount
    if (pageLoadTimeRef.current === null) {
      pageLoadTimeRef.current = Date.now();
    }

    const checkPulse = () => {
      const interactions = getOnboardingInteractions();
      const currentInteractionKey = getInteractionKey(controlName);
      const hasInteracted = interactions[currentInteractionKey];

      // Stop polling if this control has been interacted with
      if (hasInteracted) {
        setShouldPulse(false);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        return;
      }

      // Check if 5 seconds have passed since page load
      const timeSinceLoad = pageLoadTimeRef.current ? Date.now() - pageLoadTimeRef.current : 0;
      if (timeSinceLoad < DELAY_MS) {
        setShouldPulse(false);
        return;
      }

      // Determine which control should pulse (first non-interacted control in sequence)
      const nextToPulse = SEQUENCE.find(control => {
        const interactionKey = getInteractionKey(control);
        return !interactions[interactionKey];
      });

      // Pulse only if this control is the next one in sequence
      setShouldPulse(nextToPulse === controlName);
    };

    // Initial check
    checkPulse();

    // Set up polling interval
    intervalRef.current = setInterval(checkPulse, POLL_INTERVAL);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [controlName]);

  return shouldPulse;
};
