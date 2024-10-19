import { type AccentColor } from "@/defaults/themeDefaults";

export class SettingsManager {
  smokeSpeed: number;
  smokeOpacity: number;
  accentColor: AccentColor;
  saturationAdjust: number;
  lightnessAdjust: number;
  spotlightIntensity: number;
  spotlightDistance: number;
  spotlightAngle: number;
  spotlightPenumbra: number;
  spotlightEnabled: boolean;
  spotlightColor: string;

  constructor(settings: Partial<SettingsManager>) {
    this.smokeSpeed = settings.smokeSpeed ?? 0.001;
    this.smokeOpacity = settings.smokeOpacity ?? 0.3;
    this.accentColor = settings.accentColor ?? 'blue';
    this.saturationAdjust = settings.saturationAdjust ?? 1;
    this.lightnessAdjust = settings.lightnessAdjust ?? 1;
    this.spotlightIntensity = settings.spotlightIntensity ?? 1.5;
    this.spotlightDistance = settings.spotlightDistance ?? 1000;
    this.spotlightAngle = settings.spotlightAngle ?? Math.PI / 6;
    this.spotlightPenumbra = settings.spotlightPenumbra ?? 0;
    this.spotlightEnabled = settings.spotlightEnabled ?? true;
    this.spotlightColor = settings.spotlightColor ?? '#ffffff';
  }

  updateSettings(newSettings: Partial<SettingsManager>) {
    Object.assign(this, newSettings);
  }
}