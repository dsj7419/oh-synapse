import React from 'react';
import { type ThemePluginProps, registerThemePlugin } from './ThemePluginArchitecture';
import type { Theme } from '@/defaults/themeDefaults';

const panel_backgrounds: Theme['panelBackground'][] = ['solid', 'translucent'];

const PanelBackgroundPicker: React.FC<ThemePluginProps> = ({ theme, onThemeChange }) => {
  return (
    <div>
      <h4 className="text-md font-medium">Panel Background</h4>
      <div className="flex gap-2">
        {panel_backgrounds.map((background) => {
          const isSelected = theme.panelBackground === background;
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
              onClick={() => onThemeChange({ panelBackground: background })}
            >
              {background.charAt(0).toUpperCase() + background.slice(1)}
            </button>
          );
        })}
      </div>
    </div>
  );
};

registerThemePlugin({
  name: 'PanelBackgroundPicker',
  component: PanelBackgroundPicker,
});

export default PanelBackgroundPicker;