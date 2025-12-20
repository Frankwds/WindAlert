// Type definition for onboarding interactions
export type OnboardingInteractions = {
  hasInteractedWithFilterControl: boolean;
  hasInteractedWithPromisingFilter: boolean;
  hasInteractedWithWindFilterCompass: boolean;
};

// Storage key for onboarding interactions
const ONBOARDING_KEY = 'windlord_onboarding_interactions';

// Default value
const DEFAULT_INTERACTIONS: OnboardingInteractions = {
  hasInteractedWithFilterControl: false,
  hasInteractedWithPromisingFilter: false,
  hasInteractedWithWindFilterCompass: false,
};

// Utility function to safely access localStorage
const safeLocalStorage = {
  getItem: (key: string): string | null => {
    try {
      if (typeof window === 'undefined') return null;
      return localStorage.getItem(key);
    } catch (error) {
      console.warn(`Failed to get localStorage item "${key}":`, error);
      return null;
    }
  },
  setItem: (key: string, value: string): void => {
    try {
      if (typeof window === 'undefined') return;
      localStorage.setItem(key, value);
    } catch (error) {
      console.warn(`Failed to set localStorage item "${key}":`, error);
    }
  },
};

// Get onboarding interactions from localStorage
export const getOnboardingInteractions = (): OnboardingInteractions => {
  const stored = safeLocalStorage.getItem(ONBOARDING_KEY);
  if (stored === null) return DEFAULT_INTERACTIONS;

  try {
    const parsed = JSON.parse(stored);
    return {
      hasInteractedWithFilterControl: Boolean(parsed.hasInteractedWithFilterControl),
      hasInteractedWithPromisingFilter: Boolean(parsed.hasInteractedWithPromisingFilter),
      hasInteractedWithWindFilterCompass: Boolean(parsed.hasInteractedWithWindFilterCompass),
    };
  } catch (error) {
    console.warn('Failed to parse onboarding interactions from localStorage:', error);
    return DEFAULT_INTERACTIONS;
  }
};

// Set a specific onboarding interaction
export const setOnboardingInteractionTrue = (
  control: 'FilterControl' | 'PromisingFilter' | 'WindFilterCompass'
): void => {
  const current = getOnboardingInteractions();
  const updated: OnboardingInteractions = {
    ...current,
    ...(control === 'FilterControl' && { hasInteractedWithFilterControl: true }),
    ...(control === 'PromisingFilter' && { hasInteractedWithPromisingFilter: true }),
    ...(control === 'WindFilterCompass' && { hasInteractedWithWindFilterCompass: true }),
  };
  safeLocalStorage.setItem(ONBOARDING_KEY, JSON.stringify(updated));
};
