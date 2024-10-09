// components/admin/playground/TypographyScalePicker.tsx

import React from 'react';
import { ThemePluginProps, registerThemePlugin } from './ThemePluginArchitecture';
import { Select } from '@radix-ui/themes';
import { Scaling } from '@/defaults/themeDefaults';

const TypographyScalePicker: React.FC<ThemePluginProps> = ({ theme, onThemeChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Typography Scale</h3>
      <Select.Root
        value={theme.typographyScale ?? '100%'}
        onValueChange={(typographyScale) => onThemeChange({ typographyScale: typographyScale as Scaling })}
      >
        <Select.Trigger className="w-full h-10 rounded-md border">
          {theme.typographyScale ?? '100%'}
        </Select.Trigger>
        <Select.Content>
          <Select.Item value="90%">90%</Select.Item>
          <Select.Item value="95%">95%</Select.Item>
          <Select.Item value="100%">100%</Select.Item>
          <Select.Item value="105%">105%</Select.Item>
          <Select.Item value="110%">110%</Select.Item>
        </Select.Content>
      </Select.Root>
    </div>
  );
};

registerThemePlugin({
  name: 'TypographyScalePicker',
  component: TypographyScalePicker,
});

export default TypographyScalePicker;