// defaults/themeDefaults.ts
export type AccentColor =
  | 'gray' | 'gold' | 'bronze' | 'brown' | 'yellow' | 'amber' | 'orange' | 'tomato'
  | 'red' | 'ruby' | 'crimson' | 'pink' | 'plum' | 'purple' | 'violet' | 'iris'
  | 'indigo' | 'blue' | 'cyan' | 'teal' | 'jade' | 'green' | 'grass' | 'lime'
  | 'mint' | 'sky';
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
  typographyScale: Scaling;
  smokeSpeed?: number;
  smokeOpacity?: number;
  saturationAdjust?: number;
  lightnessAdjust?: number;
  spotlightIntensity?: number;
  spotlightDistance?: number;
  spotlightAngle?: number;
  spotlightPenumbra?: number;
  spotlightColor?: string;
  spotlightEnabled?: boolean;
  updatedAt?: Date;
  webglLogoText: string;
  webglLogoFontSize: number;
  webglLogoFontFamily: string;
  webglLogoColor: string;
  webglLogoAnimSpeed: number;
  webglLogoInterRadius: number;
  webglLargeText: string;
  webglLargeFontSize: number;
  webglLargeFontFamily: string;
  webglLargeColor: string;
  webglLargeAnimSpeed: number;
  webglLargeInterRadius: number;
  webglLargeChangeInterval: number;
}

export const THEME_DEFAULTS: Theme = {
  name: 'light',
  appearance: 'light',
  accentColor: 'indigo',
  grayColor: 'gray',
  primaryColor: '#000000',
  font: 'Arial',
  layout: 'grid',
  radius: 'medium',
  scaling: '100%',
  panelBackground: 'solid',
  typographyScale: '100%',
  smokeSpeed: 0.001,
  smokeOpacity: 0.3,
  saturationAdjust: 1,
  lightnessAdjust: 1,
  spotlightIntensity: 1.5,
  spotlightDistance: 1000,
  spotlightAngle: Math.PI / 6,
  spotlightPenumbra: 0,
  spotlightColor: "#ffffff",
  spotlightEnabled: true,
  webglLogoText: 'OHSynapse',
  webglLogoFontSize: 24,
  webglLogoFontFamily: 'Arial',
  webglLogoColor: '#ffffff',
  webglLogoAnimSpeed: 0.05,
  webglLogoInterRadius: 50,
  webglLargeText: JSON.stringify(['Welcome', 'to', 'OHSynapse']),
  webglLargeFontSize: 64,
  webglLargeFontFamily: 'Arial',
  webglLargeColor: '#ffffff',
  webglLargeAnimSpeed: 0.05,
  webglLargeInterRadius: 100,
  webglLargeChangeInterval: 5000,
};