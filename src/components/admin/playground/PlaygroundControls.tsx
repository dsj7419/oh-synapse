"use client";

import { useState } from 'react';
import ColorPicker from './ColorPicker';
import FontPicker from './FontPicker';
import LayoutPicker from './LayoutPicker';
import RadiusPicker from './RadiusPicker';
import ScalingPicker from './ScalingPicker';
import AppearancePicker from './AppearancePicker';
import PanelBackgroundPicker from './PanelBackgroundPicker';
import { useThemeContext } from '@/context/ThemeContext';
import type { Theme } from '@/defaults/themeDefaults';
import { api } from '@/trpc/react';
import { Box, Text, Button } from '@radix-ui/themes';

export const PlaygroundControls = () => {
  const { theme, updateTheme } = useThemeContext();
  const [, setIsSaved] = useState(false);

  const saveThemeMutation = api.playground.saveTheme.useMutation({
    onSuccess: () => {
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3000);
    },
    onError: () => {
      setIsSaved(false);
    },
  });

  const handleChange = (newTheme: Partial<Theme>) => {
    updateTheme(newTheme);
  };

  const handleSave = () => {
    saveThemeMutation.mutate({ theme });
  };

  return (
    <Box
      className="space-y-4"
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        padding: '16px',
        borderRadius: 'var(--radius-4)',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-1)',
      }}
    >
      <Text
        size="6"
        weight="bold"
        style={{
          textAlign: 'center',
        }}
      >
        Customize Theme
      </Text>

      <ColorPicker
        theme={{ accentColor: theme.accentColor, grayColor: theme.grayColor }}
        onAccentColorChange={(color) => handleChange({ accentColor: color })}
        onGrayColorChange={(color) => handleChange({ grayColor: color })}
      />

      <FontPicker
        theme={{ font: theme.font }}
        onFontChange={(font) => handleChange({ font })}
      />

      <LayoutPicker
        theme={{ layout: theme.layout }}
        onLayoutChange={(layout) => handleChange({ layout })}
      />

      <RadiusPicker
        theme={{ radius: theme.radius }}
        onRadiusChange={(radius) => handleChange({ radius })}
      />

      <ScalingPicker
        theme={{ scaling: theme.scaling }}
        onScalingChange={(scaling) => handleChange({ scaling: scaling as Theme['scaling'] })}
      />

      <AppearancePicker
        theme={{ appearance: theme.appearance }}
        onAppearanceChange={(appearance) => handleChange({ appearance })}
      />

      <PanelBackgroundPicker
        theme={{ panelBackground: theme.panelBackground }}
        onPanelBackgroundChange={(background) =>
          handleChange({ panelBackground: background })
        }
      />

<div className="mt-6">
        <Button
          onClick={handleSave}
          disabled={saveThemeMutation.status === 'pending'}
          variant="solid"
          size="2"
          style={{
            width: '100%',
            backgroundColor: 'var(--accent-9)',
            color: 'var(--accent-contrast)',
          }}
        >
          {saveThemeMutation.status === 'pending' ? 'Saving...' : 'Save Theme'}
        </Button>
        {/* ... (success and error messages) */}
      </div>
    </Box>
  );
};