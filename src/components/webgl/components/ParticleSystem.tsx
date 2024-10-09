// components/ParticleSystem.tsx
import React, { useRef, useEffect } from 'react';
import { createParticles, updateParticles, renderParticles } from '../utils/webglParticleUtils';
import { ParticleSystemProps, Particle } from '../types';

const ParticleSystem: React.FC<ParticleSystemProps> = ({ gl, program, config, mouse, particles: initialParticles }) => {
  const particlesRef = useRef<Particle[]>(initialParticles);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!gl || !program) {
      console.error('GL context or program not available');
      return;
    }

    const animate = (time: number) => {
      updateParticles(particlesRef.current, mouse, config, 1/60, []); // Add textCoordinates here
      renderParticles(gl, program, particlesRef.current, config);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gl, program, config, mouse]);

  return null;
};

export default ParticleSystem;