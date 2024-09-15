// src/defaults/themeDefaults.ts

export type AccentColor =
  | 'gray'
  | 'gold'
  | 'bronze'
  | 'brown'
  | 'yellow'
  | 'amber'
  | 'orange'
  | 'tomato'
  | 'red'
  | 'ruby'
  | 'crimson'
  | 'pink'
  | 'plum'
  | 'purple'
  | 'violet'
  | 'iris'
  | 'indigo'
  | 'blue'
  | 'cyan'
  | 'teal'
  | 'jade'
  | 'green'
  | 'grass'
  | 'lime'
  | 'mint'
  | 'sky';

export type GrayColor = 'auto' | 'gray' | 'mauve' | 'slate' | 'sage' | 'olive' | 'sand';

export type Radius = 'none' | 'small' | 'medium' | 'large' | 'full';

export type Scaling = '90%' | '95%' | '100%' | '105%' | '110%';

export type PanelBackground = 'solid' | 'translucent';

export interface Theme {
  id?: string;
  name: string;
  appearance: 'light' | 'dark';
  accentColor: AccentColor;
  grayColor: GrayColor;
  primaryColor: string;
  font: string;
  layout: string;
  radius: Radius;
  scaling: Scaling;
  panelBackground: PanelBackground;
  updatedAt?: Date;
}

export const THEME_DEFAULTS: Theme = {
  name: 'Light',
  appearance: 'light',
  accentColor: 'indigo',
  grayColor: 'gray',
  primaryColor: '#000000',
  font: 'Arial',
  layout: 'Grid',
  radius: 'medium',
  scaling: '100%',
  panelBackground: 'solid',
};
