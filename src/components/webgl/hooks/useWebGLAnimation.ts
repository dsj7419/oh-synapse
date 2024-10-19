import { useRef, useEffect } from 'react';
import { type WebGLConfig } from '../types';

export const useWebGLAnimation = (
  gl: WebGLRenderingContext | null,
  program: WebGLProgram | null,
  config: WebGLConfig
) => {
  const timeRef = useRef(0);
  const lastFrameTimeRef = useRef(0);

  useEffect(() => {
    if (!gl || !program) return;

    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastFrameTimeRef.current;
      lastFrameTimeRef.current = currentTime;
      timeRef.current += deltaTime * 0.001; 

      const timeUniformLocation = gl.getUniformLocation(program, 'u_time');
      gl.uniform1f(timeUniformLocation, timeRef.current);

      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [gl, program, config]);

  return timeRef.current;
};