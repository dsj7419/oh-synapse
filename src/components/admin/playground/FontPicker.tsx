import React from 'react';
import { type ThemePluginProps, registerThemePlugin } from './ThemePluginArchitecture';
import { Select } from '@radix-ui/themes';

const FontPicker: React.FC<ThemePluginProps> = ({ theme, onThemeChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Font</h3>
      <Select.Root
        value={theme.font}
        onValueChange={(font) => onThemeChange({ font })}
      >
        <Select.Trigger className="w-full h-10 rounded-md border">
          {theme.font || 'Select Font'} {/* Directly render the selected font */}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="arial">Arial</Select.Item>
          <Select.Item value="roboto">Roboto</Select.Item>
          <Select.Item value="times new roman">Times New Roman</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  );
};

registerThemePlugin({
  name: 'FontPicker',
  component: FontPicker,
});

export default FontPicker;
