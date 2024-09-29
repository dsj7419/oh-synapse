import React from 'react';
import { ThemePluginProps, registerThemePlugin } from './ThemePluginArchitecture';
import { Select } from '@radix-ui/themes';
import type { Theme } from '@/defaults/themeDefaults';

const ScalingPicker: React.FC<ThemePluginProps> = ({ theme, onThemeChange }) => {
  return (
    <div>
      <h3 className="text-lg font-medium">Scaling</h3>
      <Select.Root
        value={theme.scaling}
        onValueChange={(scaling: Theme['scaling']) => onThemeChange({ scaling })}
      >
        <Select.Trigger className="w-full h-10 rounded-md border" />
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
  name: 'ScalingPicker',
  component: ScalingPicker,
});

export default ScalingPicker;