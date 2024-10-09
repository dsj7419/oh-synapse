// src/components/background/smoke/SmokeMaterial.ts
import * as THREE from "three";
import { Theme } from "@/defaults/themeDefaults";

export const createSmokeMaterial = (theme: Partial<Theme>): THREE.MeshPhongMaterial => {
  const color = new THREE.Color(theme.accentColor);
  const hsl = { h: 0, s: 0, l: 0 };
  color.getHSL(hsl);
  hsl.s = Math.min(1, Math.max(0, hsl.s * (theme.saturationAdjust ?? 1)));
  hsl.l = Math.min(1, Math.max(0, hsl.l * (theme.lightnessAdjust ?? 1)));
  color.setHSL(hsl.h, hsl.s, hsl.l);

  return new THREE.MeshPhongMaterial({
    color: color,
    transparent: true,
    opacity: theme.smokeOpacity ?? (theme.appearance === "dark" ? 0.15 : 0.001),
    map: new THREE.TextureLoader().load("https://utfs.io/f/ifgrhpzuqlmx3lyxhjkbor6vo5u1eigdlhgbznalc94c0kpn"),
    blending: THREE.AdditiveBlending,
    emissive: color.clone().multiplyScalar(0.2),
  });
};