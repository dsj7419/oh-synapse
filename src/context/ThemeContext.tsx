"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';
import { api } from '@/trpc/react';
import { THEME_DEFAULTS } from '@/defaults/themeDefaults';
import type { Theme } from '@/defaults/themeDefaults';
import { Theme as RadixTheme } from '@radix-ui/themes';
import ThemeLoadingAnimation from '@/components/loading/ThemeLoadingAnimation';

interface ThemeContextProps {
  theme: Theme;
  updateTheme: (newTheme: Partial<Theme>) => void;
}

const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme | null>(null);
  const { data: initialTheme, isLoading } = api.playground.getTheme.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  useEffect(() => {
    if (initialTheme) {
      setTheme({
        ...THEME_DEFAULTS,
        ...initialTheme,
      });
    }
  }, [initialTheme]);

  const updateTheme = (newTheme: Partial<Theme>) => {
    setTheme((prevTheme) => {
      if (!prevTheme) return null;
      return {
        ...prevTheme,
        ...newTheme,
      };
    });
  };

  const contextValue = useMemo(
    () => ({ theme: theme as Theme, updateTheme }),
    [theme, updateTheme]
  );

  if (isLoading || !theme) {
    return <ThemeLoadingAnimation isLoading={true} />;
  }
  
  return (
    <ThemeContext.Provider value={contextValue}>
      <RadixTheme
        appearance={theme.appearance}
        accentColor={theme.accentColor}
        grayColor={theme.grayColor}
        radius={theme.radius}
        scaling={theme.scaling}
        panelBackground={theme.panelBackground}
      >
        <div
          style={{
            fontFamily: theme.font,
            fontSize: theme.typographyScale,
          }}
        >
          {children}
        </div>
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
