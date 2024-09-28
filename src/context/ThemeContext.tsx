"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '@/trpc/react';
import { THEME_DEFAULTS } from '@/defaults/themeDefaults';
import type { Theme } from '@/defaults/themeDefaults';
import { Theme as RadixTheme } from '@radix-ui/themes';

interface ThemeContextProps {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(THEME_DEFAULTS);

  const { data: initialTheme } = api.playground.getTheme.useQuery();

  useEffect(() => {
    if (initialTheme) {
      setTheme((prevTheme) => ({
        ...prevTheme,
        ...initialTheme,
      }));
    }
  }, [initialTheme]);

  const updateTheme = (newTheme: Partial<Theme>) => {
    setTheme((prevTheme) => ({
      ...prevTheme,
      ...newTheme,
    }));
  };

  return (
    <ThemeContext.Provider value={{ theme, updateTheme }}>
      <RadixTheme
        appearance={theme.appearance}
        accentColor={theme.accentColor}
        grayColor={theme.grayColor}
        radius={theme.radius}
        scaling={theme.scaling}
        panelBackground={theme.panelBackground}
      >
        {children}
      </RadixTheme>
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
