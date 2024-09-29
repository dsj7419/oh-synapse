"use client";
import React from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import { api } from '@/trpc/react';
import { Box, Text, Button } from '@radix-ui/themes';
import { themePlugins, ThemePluginProps } from './ThemePluginArchitecture';
import type { Theme } from '@/defaults/themeDefaults';

import './ColorPicker';
import './FontPicker';
import './LayoutPicker';
import './RadiusPicker';
import './ScalingPicker';
import './AppearancePicker';
import './PanelBackgroundPicker';

export const PlaygroundControls: React.FC = () => {
  const { theme, updateTheme } = useThemeContext();
  const [isSaved, setIsSaved] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const saveThemeMutation = api.playground.saveTheme.useMutation({
    onSuccess: () => {
      setIsSaved(true);
      setError(null);
      setTimeout(() => setIsSaved(false), 3000);
    },
    onError: (err) => {
      setIsSaved(false);
      setError(err.message);
    },
  });

  const handleChange = (newTheme: Partial<Theme>) => {
    updateTheme(newTheme);
  };

  const handleSave = () => {
    saveThemeMutation.mutate({ theme });
  };

  const pluginProps: ThemePluginProps = {
    theme,
    onThemeChange: handleChange,
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
      data-testid="playground-controls"
    >
      <Text size="6" weight="bold" style={{ textAlign: 'center' }}>
        Customize Theme
      </Text>
      
      {/* Render all registered theme plugins */}
      {themePlugins.map((plugin) => (
        <React.Fragment key={plugin.name}>
          <plugin.component {...pluginProps} />
        </React.Fragment>
      ))}

      <div className="mt-6">
        <Button
          onClick={handleSave}
          disabled={saveThemeMutation.isPending}
          variant="solid"
          size="2"
          style={{
            width: '100%',
            backgroundColor: 'var(--accent-9)',
            color: 'var(--accent-contrast)',
          }}
        >
          {saveThemeMutation.isPending ? 'Saving...' : 'Save Theme'}
        </Button>
      </div>

      {isSaved && (
        <Text size="2" style={{ color: 'var(--color-success)', textAlign: 'center' }}>
          Theme saved successfully!
        </Text>
      )}
      {error && (
        <Text size="2" style={{ color: 'var(--color-error)', textAlign: 'center' }}>
          Error saving theme: {error}
        </Text>
      )}
    </Box>
  );
};

export default PlaygroundControls;
