// types.ts
import { Theme } from '@/defaults/themeDefaults';

export interface WebGLRendererProps {
  width: number;
  height: number;
  render: (gl: WebGLRenderingContext, program: WebGLProgram, deltaTime: number, currentTime: number) => void;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  setGL: (gl: WebGLRenderingContext | null) => void;
  setProgram: (program: WebGLProgram | null) => void;
}

export interface ParticleSystemProps {
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  config: WebGLConfig;
  mouse: { x: number; y: number; radius: number };
  particles: Particle[];
}

export interface TextToParticlesConfig {
  gl: WebGLRenderingContext;
  text: string[];
  width: number;
  height: number;
  isLogo: boolean;
  theme: Theme;
  fontSize: number;
  fontFamily: string;
  color: string;
  animSpeed: number;
}

export interface BaseWebGLTextProps {
  width: number;
  height: number;
  isLogo: boolean;
  theme: Theme;
}

export interface EnhancedWebGLTextProps extends BaseWebGLTextProps {}

export interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  baseColor: [number, number, number, number]; 
  color: [number, number, number, number];
  size: number;
  angle: number;
  angularVelocity: number;
  life: number;
}

export interface WebGLConfig {
  particleCount: number;
  mouseRadius: number;
  particleSize: number;
  forceMultiplier: number;
  returnSpeed: number;
  velocityDamping: number;
  colorMultiplier: number;
  saturationMultiplier: number;
  textChangeInterval: number;
  rotationForceMultiplier: number;
  colorTransitionSpeed: number;
  sizeFluctuationSpeed: number;
  sizeFluctuationAmount: number;
  animSpeed: number;
  minParticleSize: number;
  maxParticleSize: number;
  angularVelocity: number;
}
