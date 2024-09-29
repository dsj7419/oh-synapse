import React from 'react';
import type { Theme } from '@/defaults/themeDefaults';
import { ThemePluginProps, registerThemePlugin } from './ThemePluginArchitecture';

const accent_colors: Theme['accentColor'][] = [
  'gray', 'gold', 'bronze', 'brown', 'yellow', 'amber', 'orange', 'tomato', 'red', 'ruby', 'crimson',
  'pink', 'plum', 'purple', 'violet', 'iris', 'indigo', 'blue', 'cyan', 'teal', 'jade', 'green',
  'grass', 'lime', 'mint', 'sky',
];

const gray_colors: Theme['grayColor'][] = [
  'gray', 'mauve', 'slate', 'sage', 'olive', 'sand',
];

const ColorPicker: React.FC<ThemePluginProps> = ({ theme, onThemeChange }) => {
  const handleAccentColorSelect = (color: Theme['accentColor']) => {
    onThemeChange({ accentColor: color });
  };

  const handleGrayColorSelect = (color: Theme['grayColor']) => {
    onThemeChange({ grayColor: color });
  };

  return (
    <div>
      <h4 className="text-md font-medium text-center">Accent Color</h4>
      <div className="grid grid-cols-6 gap-2">
        {accent_colors.map((color) => (
          <div
            key={color}
            className={`w-6 h-6 rounded-full cursor-pointer ${
              theme.accentColor === color ? 'ring-2 ring-black' : ''
            }`}
            style={{ backgroundColor: `var(--${color}-9)` }}
            onClick={() => handleAccentColorSelect(color)}
          />
        ))}
      </div>
      <h4 className="text-md font-medium mt-4 text-center">Gray Color</h4>
      <div className="grid grid-cols-6 gap-2">
        {gray_colors.map((color) => (
          <div
            key={color}
            className={`w-6 h-6 rounded-full cursor-pointer ${
              theme.grayColor === color ? 'ring-2 ring-black' : ''
            }`}
            style={{ backgroundColor: `var(--${color}-9)` }}
            onClick={() => handleGrayColorSelect(color)}
          />
        ))}
      </div>
    </div>
  );
};

registerThemePlugin({
  name: 'ColorPicker',
  component: ColorPicker,
});

export default ColorPicker;