// components/EnhancedWebGLText.tsx
import React, { useRef, useEffect, useMemo, useCallback } from 'react';
import WebGLRenderer from './WebGLRenderer';
import { useMouseHandler } from '../hooks/useMouseHandler';
import { getWebGLConfig } from '../utils/webglConfig';
import { textToParticles } from '../utils/TextToParticles';
import { createParticles, updateParticles, renderParticles } from '../utils/webglParticleUtils';
import { hexToRgba } from '../utils/colorUtils';
import { EnhancedWebGLTextProps, Particle, WebGLConfig } from '../types';

const EnhancedWebGLText: React.FC<EnhancedWebGLTextProps> = ({ width, height, isLogo, theme }) => {
  console.log('EnhancedWebGLText: Component rendering with dimensions', { width, height });

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const timeUniformLocationRef = useRef<WebGLUniformLocation | null>(null);

  const setGL = (gl: WebGLRenderingContext | null) => {
    glRef.current = gl;
  };

  const setProgram = (program: WebGLProgram | null) => {
    programRef.current = program;
  };

  const config = useMemo(() => getWebGLConfig(isLogo, theme), [isLogo, theme]);
  const configRef = useRef<WebGLConfig>(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const mouseRef = useMouseHandler(canvasRef, isLogo ? 100 : 200);

  const particlesRef = useRef<Particle[]>([]);
  const textCoordinatesRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!glRef.current || !programRef.current) return;

    const gl = glRef.current;
    const program = programRef.current;

    gl.useProgram(program);
    timeUniformLocationRef.current = gl.getUniformLocation(program, 'u_time');
  }, []);

  const textArray = useMemo(() => {
    if (isLogo) {
      return [theme.webglLogoText];
    } else {
      return JSON.parse(theme.webglLargeText);
    }
  }, [theme, isLogo]);

  const currentTextIndexRef = useRef(0);
  const textChangeTimeoutRef = useRef<number | null>(null);

  const changeText = useCallback(() => {
    const { textChangeInterval } = configRef.current;

    currentTextIndexRef.current = (currentTextIndexRef.current + 1) % textArray.length;

    const textToRender = textArray[currentTextIndexRef.current];
    const fontSize = isLogo ? theme.webglLogoFontSize : theme.webglLargeFontSize;
    const fontFamily = isLogo ? theme.webglLogoFontFamily : theme.webglLargeFontFamily;
    const color = isLogo ? theme.webglLogoColor : theme.webglLargeColor;

    const coords = textToParticles({
      gl: glRef.current!,
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

    console.log('EnhancedWebGLText: Generated Text Coordinates:', coords);

    textCoordinatesRef.current = coords;

    const totalCoordinates = coords.length;
    particlesRef.current.forEach((particle, i) => {
      const index = totalCoordinates > 0 ? i % totalCoordinates : -1;
      const coord = index >= 0 ? coords[index] : { x: Math.random() * width, y: Math.random() * height };
      particle.baseX = coord?.x ?? 0;
      particle.baseY = coord?.y ?? 0;
    });

    // If it's the last word, add a longer pause
    let interval = textChangeInterval;
    if (currentTextIndexRef.current === textArray.length - 1) {
      interval *= 2; // Double the interval after the last word
    }

    // Clear any existing timeout
    if (textChangeTimeoutRef.current) {
      clearTimeout(textChangeTimeoutRef.current);
    }

    textChangeTimeoutRef.current = window.setTimeout(changeText, interval);
  }, [textArray, width, height, isLogo, theme]);

  useEffect(() => {
    if (textArray.length > 1 && !isLogo) {
      const interval = configRef.current.textChangeInterval;

      // Clear any existing timeout
      if (textChangeTimeoutRef.current) {
        clearTimeout(textChangeTimeoutRef.current);
      }

      // Start the initial timeout
      textChangeTimeoutRef.current = window.setTimeout(changeText, interval);
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

    console.log('EnhancedWebGLText: useEffect triggered');
    console.log('EnhancedWebGLText: Passed dimensions - Width:', width, 'Height:', height);
    console.log('EnhancedWebGLText: Theme object', theme);

    try {
      const textToRender = textArray[currentTextIndexRef.current];
      const fontSize = isLogo ? theme.webglLogoFontSize : theme.webglLargeFontSize;
      const fontFamily = isLogo ? theme.webglLogoFontFamily : theme.webglLargeFontFamily;
      const color = isLogo ? theme.webglLogoColor : theme.webglLargeColor;

      console.log('EnhancedWebGLText: Text to Render:', textToRender);
      console.log('EnhancedWebGLText: Font Size:', fontSize);
      console.log('EnhancedWebGLText: Font Family:', fontFamily);

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

      console.log('EnhancedWebGLText: Generated Text Coordinates:', coords);

      textCoordinatesRef.current = coords;

      const themeColor = hexToRgba(color);
      const newParticles = createParticles(
        configRef.current.particleCount,
        coords,
        themeColor,
        isLogo,
        configRef.current
      );
      console.log('EnhancedWebGLText: Created Particles:', newParticles);
      particlesRef.current = newParticles;

      if (textArray.length > 1 && !isLogo) {
        const interval = configRef.current.textChangeInterval;

        // Clear any existing timeout
        if (textChangeTimeoutRef.current) {
          clearTimeout(textChangeTimeoutRef.current);
        }

        textChangeTimeoutRef.current = window.setTimeout(changeText, interval);
      }
    } catch (error) {
      console.error('EnhancedWebGLText: Error during WebGL initialization', error);
    }

    return () => {
      if (textChangeTimeoutRef.current) {
        clearTimeout(textChangeTimeoutRef.current);
      }
    };
  }, [glRef.current, isLogo, theme, width, height, textArray, changeText]);

  const render = useCallback(
    (gl: WebGLRenderingContext, program: WebGLProgram, deltaTime: number, currentTime: number) => {
      try {
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
      } catch (error) {
        console.error('EnhancedWebGLText: Error during rendering', error);
      }
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

export default EnhancedWebGLText;
