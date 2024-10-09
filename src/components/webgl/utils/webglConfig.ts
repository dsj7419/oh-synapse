import { Theme } from '@/defaults/themeDefaults';
import { WebGLConfig } from '../types';

export function getWebGLConfig(isLogo: boolean, theme: Theme): WebGLConfig {
  return {
    // Total number of particles to render
    particleCount: isLogo ? 2000 : 8000,
    // Radius of mouse interaction with particles
    mouseRadius: isLogo ? 10.1 : 20.2,
    // Base size of particles
    particleSize: isLogo ? theme.webglLogoFontSize / 4 : theme.webglLargeFontSize / 4,
    // Multiplier for force applied to particles when mouse interacts
    forceMultiplier: 8.0,
    // Speed at which particles return to their original position
    returnSpeed: isLogo ? 0.5 : 0.25,
    // Damping factor for particle velocity
    velocityDamping: 0.95,
    // Controls the deviation of particle colors from the base color (lower value means less deviation)
    colorMultiplier: isLogo ? 0.02 : 0.05,
    // Controls the saturation level of particle colors (currently not used)
    saturationMultiplier: isLogo ? 1.0 : 1.0,
    // Interval between text changes (in milliseconds)
    textChangeInterval: isLogo ? 0 : theme.webglLargeChangeInterval || 10000,
    // Multiplier for rotational force applied to particles
    rotationForceMultiplier: isLogo ? 0.1 : 0.5,
    // Speed at which particle colors transition
    colorTransitionSpeed: isLogo ? 0.045 : 0.01,
    // Speed of particle size fluctuations
    sizeFluctuationSpeed: isLogo ? 0.001 : 0.001,
    // Amount by which particle size fluctuates
    sizeFluctuationAmount: isLogo ? 0.001 : 0.001,
    // Minimum particle size
    minParticleSize: isLogo ? 2 : 2,
    // Maximum particle size
    maxParticleSize: isLogo ? 2 : 4,
    // Base angular velocity of particles
    angularVelocity: isLogo ? 0.12 : 0.4,
    // Animation speed (affects overall animation timing)
    animSpeed: isLogo ? theme.webglLogoAnimSpeed : theme.webglLargeAnimSpeed,
  };
}
