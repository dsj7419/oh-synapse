import React from 'react';
import { ThemePluginProps, registerThemePlugin } from './ThemePluginArchitecture';
import { Select } from '@radix-ui/themes';
import type { Theme } from '@/defaults/themeDefaults';

const AppearancePicker: React.FC<ThemePluginProps> = ({ theme, onThemeChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Appearance</h3>
      <Select.Root
        value={theme.appearance}
        onValueChange={(appearance: Theme['appearance']) => onThemeChange({ appearance })}
      >
        <Select.Trigger className="w-full h-10 rounded-md border" />
        <Select.Content>
          <Select.Item value="light">Light</Select.Item>
          <Select.Item value="dark">Dark</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  );
};

registerThemePlugin({
  name: 'AppearancePicker',
  component: AppearancePicker,
});

export default AppearancePicker;