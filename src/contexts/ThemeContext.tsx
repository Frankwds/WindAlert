"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getTheme, setTheme, type Theme } from "../lib/localstorage/themeStorage";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("light");

  useEffect(() => {
    // Check localStorage first, then system preference
    const savedTheme = getTheme();
    if (savedTheme) {
      setThemeState(savedTheme);
    } else {
      const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      setThemeState(systemTheme);
    }
  }, []);

  useEffect(() => {
    // Update document attribute and localStorage when theme changes
    document.documentElement.setAttribute("data-theme", theme);
    setTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setThemeState(prev => prev === "light" ? "dark" : "light");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
