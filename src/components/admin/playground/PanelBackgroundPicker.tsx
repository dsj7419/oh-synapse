import { useState } from 'react';
import type { Theme } from '@/defaults/themeDefaults';

interface PanelBackgroundPickerProps {
  theme: Pick<Theme, 'panelBackground'>;
  onPanelBackgroundChange: (background: Theme['panelBackground']) => void;
}

const PANEL_BACKGROUNDS: Theme['panelBackground'][] = ['solid', 'translucent'];

const PanelBackgroundPicker = ({ theme, onPanelBackgroundChange }: PanelBackgroundPickerProps) => {
  const [selectedBackground, setSelectedBackground] = useState(theme.panelBackground);

  const handleBackgroundSelect = (background: Theme['panelBackground']) => {
    setSelectedBackground(background);
    onPanelBackgroundChange(background);
  };

  return (
    <div>
      <h4 className="text-md font-medium">Panel Background</h4>
      <div className="flex gap-2">
        {PANEL_BACKGROUNDS.map((background) => {
          const isSelected = selectedBackground === background;
          const backgroundColor = isSelected ? 'var(--accent-solid)' : 'var(--color-panel)';
          const textColor = 'var(--color-text)';

          return (
            <button
              key={background}
              className={`px-4 py-2 rounded ${
                isSelected ? 'ring-2 ring-black' : ''
              }`}
              style={{
                backgroundColor,
                color: textColor,
              }}
              onClick={() => handleBackgroundSelect(background)}
            >
              {background.charAt(0).toUpperCase() + background.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PanelBackgroundPicker;
