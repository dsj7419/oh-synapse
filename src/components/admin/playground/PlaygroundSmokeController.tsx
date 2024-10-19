"use client";

import React from 'react';
import { registerThemePlugin, type ThemePluginProps } from './ThemePluginArchitecture';
import { Slider, Flex } from '@radix-ui/themes';

const PlaygroundSmokeController: React.FC<ThemePluginProps> = ({ theme, onThemeChange }) => {
  const handleSmokeSpeedChange = (value: number[]) => {
    const newSpeed = value[0];
    onThemeChange({ smokeSpeed: newSpeed });
  };

  const handleSmokeOpacityChange = (value: number[]) => {
    const newOpacity = value[0];
    onThemeChange({ smokeOpacity: newOpacity });
  };

  const handleSaturationChange = (value: number[]) => {
    const newSaturation = value[0];
    onThemeChange({ saturationAdjust: newSaturation });
  };

  const handleLightnessChange = (value: number[]) => {
    const newLightness = value[0];
    onThemeChange({ lightnessAdjust: newLightness });
  };

  return (
    <div>
      <h4 className="text-md font-medium">Smoke Controls</h4>
      <Flex direction="column" gap="4">
        <div className="w-full">
          <label>Smoke Speed: {theme.smokeSpeed?.toFixed(3) ?? "0.001"}</label>
          <Slider
            value={[theme.smokeSpeed ?? 0.001]}
            onValueChange={handleSmokeSpeedChange}
            min={0.001}
            max={0.02}
            step={0.001}
            color={theme.accentColor}
          />
        </div>
        <div className="w-full">
          <label>Smoke Opacity: {theme.smokeOpacity?.toFixed(2) ?? "0.3"}</label>
          <Slider
            value={[theme.smokeOpacity ?? 0.3]}
            onValueChange={handleSmokeOpacityChange}
            min={0.1}
            max={1}
            step={0.05}
            color={theme.accentColor}
          />
        </div>
        <div className="w-full">
          <label>Saturation: {theme.saturationAdjust?.toFixed(1) ?? "1"}</label>
          <Slider
            value={[theme.saturationAdjust ?? 1]}
            onValueChange={handleSaturationChange}
            min={0}
            max={2}
            step={0.1}
            color={theme.accentColor}
          />
        </div>
        <div className="w-full">
          <label>Lightness: {theme.lightnessAdjust?.toFixed(1) ?? "1"}</label>
          <Slider
            value={[theme.lightnessAdjust ?? 1]}
            onValueChange={handleLightnessChange}
            min={0.5}
            max={1.5}
            step={0.1}
            color={theme.accentColor}
          />
        </div>
      </Flex>
    </div>
  );
};

registerThemePlugin({
  name: 'PlaygroundSmokeController',
  component: PlaygroundSmokeController,
});

export default PlaygroundSmokeController;