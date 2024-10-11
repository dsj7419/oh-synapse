import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import WebGLRenderer from './WebGLRenderer';
import { useMouseHandler } from '../hooks/useMouseHandler';
import { getWebGLConfig } from '../utils/webglConfig';
import { textToParticles } from '../utils/TextToParticles';
import { createParticles, updateParticles, renderParticles } from '../utils/webglParticleUtils';
import { hexToRgba } from '../utils/colorUtils';
import { EnhancedWebGLTextProps, Particle, WebGLConfig } from '../types';

const EnhancedWebGLText: React.FC<EnhancedWebGLTextProps> = ({ width, height, isLogo, theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const timeUniformLocationRef = useRef<WebGLUniformLocation | null>(null);

  const setGL = useCallback((gl: WebGLRenderingContext | null) => {
    glRef.current = gl;
  }, []);

  const setProgram = useCallback((program: WebGLProgram | null) => {
    programRef.current = program;
  }, []);

  const config = useMemo(() => getWebGLConfig(isLogo, theme), [isLogo, theme]);
  const configRef = useRef<WebGLConfig>(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const mouseRef = useMouseHandler(canvasRef, isLogo ? 100 : 200);

  const particlesRef = useRef<Particle[]>([]);
  const textCoordinatesRef = useRef<{ x: number; y: number }[]>([]);

  const textArray = useMemo(() => {
    return isLogo ? [theme.webglLogoText] : JSON.parse(theme.webglLargeText);
  }, [theme, isLogo]);

  const currentTextIndexRef = useRef(0);
  const textChangeTimeoutRef = useRef<number | null>(null);

  const changeText = useCallback(() => {
    if (!glRef.current) return;

    const { textChangeInterval } = configRef.current;
    currentTextIndexRef.current = (currentTextIndexRef.current + 1) % textArray.length;
    const textToRender = textArray[currentTextIndexRef.current];
    const fontSize = isLogo ? theme.webglLogoFontSize : theme.webglLargeFontSize;
    const fontFamily = isLogo ? theme.webglLogoFontFamily : theme.webglLargeFontFamily;
    const color = isLogo ? theme.webglLogoColor : theme.webglLargeColor;

    const coords = textToParticles({
      gl: glRef.current,
      text: [textToRender],
      width,
      height,
      isLogo,
      theme,
      fontSize,
      fontFamily,
      color,
      animSpeed: configRef.current.animSpeed,
    });

    textCoordinatesRef.current = coords;

    const totalCoordinates = coords.length;
    particlesRef.current.forEach((particle, i) => {
      const index = totalCoordinates > 0 ? i % totalCoordinates : -1;
      const coord = index >= 0 ? coords[index] : { x: Math.random() * width, y: Math.random() * height };
      particle.baseX = coord?.x ?? 0;
      particle.baseY = coord?.y ?? 0;
    });

    if (textChangeTimeoutRef.current) {
      clearTimeout(textChangeTimeoutRef.current);
    }

    textChangeTimeoutRef.current = window.setTimeout(changeText, textChangeInterval);
  }, [textArray, width, height, isLogo, theme]);

  useEffect(() => {
    if (textArray.length > 1 && !isLogo) {
      changeText();
    }
    return () => {
      if (textChangeTimeoutRef.current) {
        clearTimeout(textChangeTimeoutRef.current);
      }
    };
  }, [changeText, textArray, isLogo]);

  useEffect(() => {
    if (!glRef.current) return;
    const gl = glRef.current;

    const textToRender = textArray[currentTextIndexRef.current];
    const fontSize = isLogo ? theme.webglLogoFontSize : theme.webglLargeFontSize;
    const fontFamily = isLogo ? theme.webglLogoFontFamily : theme.webglLargeFontFamily;
    const color = isLogo ? theme.webglLogoColor : theme.webglLargeColor;

    const coords = textToParticles({
      gl,
      text: [textToRender],
      width,
      height,
      isLogo,
      theme,
      fontSize,
      fontFamily,
      color,
      animSpeed: configRef.current.animSpeed,
    });

    textCoordinatesRef.current = coords;

    const themeColor = hexToRgba(color);
    const newParticles = createParticles(
      configRef.current.particleCount,
      coords,
      themeColor,
      isLogo,
      configRef.current
    );
    particlesRef.current = newParticles;

  }, [glRef.current, isLogo, theme, width, height, textArray]);

  const render = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram, deltaTime: number, currentTime: number) => {
      if (!gl || !program) return;

      gl.useProgram(program);

      updateParticles(
        particlesRef.current,
        mouseRef.current,
        configRef.current,
        deltaTime,
        textCoordinatesRef.current
      );

      if (timeUniformLocationRef.current) {
        gl.uniform1f(timeUniformLocationRef.current, currentTime * 0.001);
      }

      renderParticles(gl, program, particlesRef.current, configRef.current);
    },
    []
  );

  return (
    <WebGLRenderer
      width={width}
      height={height}
      render={render}
      canvasRef={canvasRef}
      setGL={setGL}
      setProgram={setProgram}
    />
  );
};

export default React.memo(EnhancedWebGLText);