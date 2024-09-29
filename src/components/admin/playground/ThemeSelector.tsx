import React from 'react';
import { ThemePluginProps, registerThemePlugin } from './ThemePluginArchitecture';
import { Select } from '@radix-ui/themes';

const ThemeSelector: React.FC<ThemePluginProps> = ({ theme, onThemeChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Theme</h3>
      <Select.Root
        value={theme.name}
        onValueChange={(name) => onThemeChange({ name })}
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
  name: 'ThemeSelector',
  component: ThemeSelector,
});

export default ThemeSelector;