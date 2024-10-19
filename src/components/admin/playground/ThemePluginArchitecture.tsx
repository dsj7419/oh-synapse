import type React from 'react';
import type { Theme } from '@/defaults/themeDefaults';

export interface ThemePluginProps {
  theme: Partial<Theme>;
  onThemeChange: (newTheme: Partial<Theme>) => void;
}

export interface ThemePlugin {
  name: string;
  component: React.ComponentType<ThemePluginProps>;
}

export const themePlugins: ThemePlugin[] = [];

export function registerThemePlugin(plugin: ThemePlugin) {
  themePlugins.push(plugin);
}