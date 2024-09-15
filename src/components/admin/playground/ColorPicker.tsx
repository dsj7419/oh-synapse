// src/components/admin/playground/ColorPicker.tsx

import { useState } from 'react';
import type { Theme } from '@/defaults/themeDefaults';

interface ColorPickerProps {
  theme: Pick<Theme, 'accentColor' | 'grayColor'>;
  onAccentColorChange: (color: Theme['accentColor']) => void;
  onGrayColorChange: (color: Theme['grayColor']) => void;
}

const ACCENT_COLORS: Theme['accentColor'][] = [
  'gray', 'gold', 'bronze', 'brown', 'yellow', 'amber', 'orange', 'tomato', 'red',
  'ruby', 'crimson', 'pink', 'plum', 'purple', 'violet', 'iris', 'indigo', 'blue',
  'cyan', 'teal', 'jade', 'green', 'grass', 'lime', 'mint', 'sky',
];

const GRAY_COLORS: Theme['grayColor'][] = [
  'gray', 'mauve', 'slate', 'sage', 'olive', 'sand',
];

const ColorPicker = ({ theme, onAccentColorChange, onGrayColorChange }: ColorPickerProps) => {
  const [selectedAccentColor, setSelectedAccentColor] = useState(theme.accentColor);
  const [selectedGrayColor, setSelectedGrayColor] = useState(theme.grayColor);

  const handleAccentColorSelect = (color: Theme['accentColor']) => {
    setSelectedAccentColor(color);
    onAccentColorChange(color);
  };

  const handleGrayColorSelect = (color: Theme['grayColor']) => {
    setSelectedGrayColor(color);
    onGrayColorChange(color);
  };

  return (
    <div>
      <h4 className="text-md font-medium text-center">Accent Color</h4>
      <div className="grid grid-cols-6 gap-2">
        {ACCENT_COLORS.map((color) => (
          <div
            key={color}
            className={`w-6 h-6 rounded-full cursor-pointer ${
              selectedAccentColor === color ? 'ring-2 ring-black' : ''
            }`}
            style={{ backgroundColor: `var(--${color}-9)` }}
            onClick={() => handleAccentColorSelect(color)}
          />
        ))}
      </div>

      <h4 className="text-md font-medium mt-4 text-center">Gray Color</h4>
      <div className="grid grid-cols-6 gap-2">
        {GRAY_COLORS.map((color) => (
          <div
            key={color}
            className={`w-6 h-6 rounded-full cursor-pointer ${
              selectedGrayColor === color ? 'ring-2 ring-black' : ''
            }`}
            style={{ backgroundColor: `var(--${color}-9)` }}
            onClick={() => handleGrayColorSelect(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPicker;
