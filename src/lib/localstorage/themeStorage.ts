// Type definition
export type Theme = 'light' | 'dark';

// Storage key for theme state
const THEME_KEY = 'windlord_theme';

// Default value
const DEFAULT_THEME: Theme = 'light';

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
  }
};

// Theme methods
export const getTheme = (): Theme => {
  const stored = safeLocalStorage.getItem(THEME_KEY);
  if (stored === null) return DEFAULT_THEME;

  // Validate the stored theme
  if (stored === 'light' || stored === 'dark') {
    return stored as Theme;
  }

  console.warn(`Invalid theme stored in localStorage: "${stored}". Using default.`);
  return DEFAULT_THEME;
};

export const setTheme = (theme: Theme): void => {
  safeLocalStorage.setItem(THEME_KEY, theme);
};
