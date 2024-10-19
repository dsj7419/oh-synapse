import React from 'react';
import { type ThemePluginProps, registerThemePlugin } from './ThemePluginArchitecture';
import { Select } from '@radix-ui/themes';

const LayoutPicker: React.FC<ThemePluginProps> = ({ theme, onThemeChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Layout</h3>
      <Select.Root
        value={theme.layout} 
        onValueChange={(layout) => onThemeChange({ layout })}
      >
        <Select.Trigger className="w-full h-10 rounded-md border">
          {theme.layout || 'Select Layout'} {/* Directly render the selected layout */}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="grid">Grid</Select.Item>
          <Select.Item value="list">List</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  );
};

registerThemePlugin({
  name: 'LayoutPicker',
  component: LayoutPicker,
});

export default LayoutPicker;
