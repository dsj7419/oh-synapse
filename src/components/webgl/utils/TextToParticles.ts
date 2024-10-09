// utils/textToParticles.ts
import { getTextCoordinates } from './webglTextUtils';
import { TextToParticlesConfig } from '../types';

export const textToParticles = (config: TextToParticlesConfig): { x: number; y: number }[] => {
  const { gl, text, width, height, isLogo, theme, fontSize, fontFamily, color } = config;

  console.log('Running textToParticles with:', text);

  const coordinates = getTextCoordinates(
    gl,
    text,
    width,
    height,
    isLogo,
    theme,
    fontSize,
    fontFamily,
    color
  );

  if (coordinates.length === 0) {
    console.error('No text coordinates generated');
    return [];
  }

  console.log('Text Coordinates:', coordinates);

  return coordinates;
};
