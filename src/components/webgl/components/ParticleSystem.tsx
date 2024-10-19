import React, { useRef, useEffect } from "react";
import { updateParticles, renderParticles } from "../utils/webglParticleUtils";
import { type ParticleSystemProps, type Particle } from "../types";

const ParticleSystem: React.FC<ParticleSystemProps> = ({
  gl,
  program,
  config,
  mouse,
  particles: initialParticles,
  isWindowFocused,
  isMouseOverCanvas,
}) => {
  const particlesRef = useRef<Particle[]>(initialParticles);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (!gl || !program) {
      console.error("GL context or program not available");
      return;
    }

    const animate = (time: number) => {
      updateParticles(
        particlesRef.current,
        mouse,
        config,
        1 / 60,
        [],
        isWindowFocused.current ?? false,
        isMouseOverCanvas.current ?? false,
      );
      renderParticles(gl, program, particlesRef.current, config);
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate(0);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gl, program, config, mouse, isWindowFocused, isMouseOverCanvas]);

  return null;
};

export default ParticleSystem;
