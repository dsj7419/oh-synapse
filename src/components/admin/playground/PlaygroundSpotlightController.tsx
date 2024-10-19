"use client";

import React from 'react';
import { registerThemePlugin, type ThemePluginProps } from './ThemePluginArchitecture';
import { Slider, Flex, Switch } from '@radix-ui/themes';
import { type Theme } from '@/defaults/themeDefaults';

interface ExtendedTheme extends Theme {
  spotlightColor?: string;
  spotlightEnabled?: boolean;
}

interface ExtendedThemePluginProps extends Omit<ThemePluginProps, 'theme'> {
  theme: Partial<ExtendedTheme>;
  onThemeChange: (newTheme: Partial<ExtendedTheme>) => void;
}

const PlaygroundSpotlightController: React.FC<ExtendedThemePluginProps> = ({ theme, onThemeChange }) => {
  const handleSpotlightIntensityChange = (value: number[]) => {
    const newIntensity = value[0];
    onThemeChange({ spotlightIntensity: newIntensity });
  };

  const handleSpotlightDistanceChange = (value: number[]) => {
    const newDistance = value[0];
    onThemeChange({ spotlightDistance: newDistance });
  };

  const handleSpotlightAngleChange = (value: number[]) => {
    const newAngle = value[0];
    onThemeChange({ spotlightAngle: newAngle });
  };

  const handleSpotlightPenumbraChange = (value: number[]) => {
    const newPenumbra = value[0];
    onThemeChange({ spotlightPenumbra: newPenumbra });
  };

  const handleSpotlightColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onThemeChange({ spotlightColor: event.target.value });
  };

  const handleSpotlightEnabledChange = (checked: boolean) => {
    onThemeChange({ spotlightEnabled: checked });
  };

  return (
    <div>
      <h4 className="text-md font-medium">Spotlight Controls</h4>
      <Flex direction="column" gap="4">
        <div className="flex items-center justify-between">
          <label>Enable Spotlight</label>
          <Switch
            checked={theme.spotlightEnabled ?? true}
            onCheckedChange={handleSpotlightEnabledChange}
          />
        </div>
        <div className="w-full">
          <label>Spotlight Color</label>
          <input
            type="color"
            value={theme.spotlightColor ?? "#ffffff"}
            onChange={handleSpotlightColorChange}
            className="w-full h-8 mt-1"
          />
        </div>
        <div className="w-full">
          <label>Spotlight Intensity: {theme.spotlightIntensity?.toFixed(1) ?? "1.5"}</label>
          <Slider
            value={[theme.spotlightIntensity ?? 1.5]}
            onValueChange={handleSpotlightIntensityChange}
            min={0}
            max={100}
            step={0.5}
            color={theme.accentColor}
          />
        </div>
        <div className="w-full">
          <label>Spotlight Distance: {theme.spotlightDistance ?? 1000}</label>
          <Slider
            value={[theme.spotlightDistance ?? 1000]}
            onValueChange={handleSpotlightDistanceChange}
            min={100}
            max={5000}
            step={100}
            color={theme.accentColor}
          />
        </div>
        <div className="w-full">
          <label>Spotlight Angle: {(theme.spotlightAngle ?? Math.PI / 6).toFixed(2)}</label>
          <Slider
            value={[theme.spotlightAngle ?? Math.PI / 6]}
            onValueChange={handleSpotlightAngleChange}
            min={0}
            max={Math.PI / 2}
            step={0.01}
            color={theme.accentColor}
          />
        </div>
        <div className="w-full">
          <label>Spotlight Penumbra: {theme.spotlightPenumbra?.toFixed(2) ?? "0"}</label>
          <Slider
            value={[theme.spotlightPenumbra ?? 0]}
            onValueChange={handleSpotlightPenumbraChange}
            min={0}
            max={1}
            step={0.05}
            color={theme.accentColor}
          />
        </div>
      </Flex>
    </div>
  );
};

registerThemePlugin({
  name: 'PlaygroundSpotlightController',
  component: PlaygroundSpotlightController as React.ComponentType<ThemePluginProps>,
});

export default PlaygroundSpotlightController;