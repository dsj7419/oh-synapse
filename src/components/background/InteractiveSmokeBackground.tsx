"use client";

import * as THREE from "three";
import { useEffect, useRef } from "react";
import { useThemeContext } from "@/context/ThemeContext";
import { createSmokeParticles, updateSmokeParticles, type SmokeParticle } from "./smoke/SmokeParticles";
import { createSpotlight } from "./lights/Spotlight";

interface InteractiveSmokeBackgroundProps {
  smokeSpeed: number;
  smokeOpacity: number;
}

const InteractiveSmokeBackground: React.FC<InteractiveSmokeBackgroundProps> = ({
  smokeSpeed,
  smokeOpacity,
}) => {
  const { theme } = useThemeContext();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const light1Ref = useRef<THREE.SpotLight | null>(null);
  const light2Ref = useRef<THREE.SpotLight | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const overlay = overlayRef.current;
    if (!canvas || !overlay) return;

    let renderer: THREE.WebGLRenderer, scene: THREE.Scene, camera: THREE.PerspectiveCamera;
    let smokeParticles: SmokeParticle[] = [];
    const clock = new THREE.Clock();

    const init = () => {
      // Renderer
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);

      // Scene
      scene = new THREE.Scene();

      // Camera
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
      camera.position.z = 1000;
      scene.add(camera);

      // Smoke Particles
      smokeParticles = createSmokeParticles(scene, { ...theme, smokeOpacity });

      // Ambient Light
      const ambientLight = new THREE.AmbientLight(0x444444, 0.2);
      scene.add(ambientLight);

      // Directional Light
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
      directionalLight.position.set(-1, 0, 1);
      scene.add(directionalLight);

      // First Spotlight
      const light1 = createSpotlight(scene, {
        color: theme.spotlightColor ?? 0xffffff,
        intensity: theme.spotlightIntensity ?? 1.5,
        distance: theme.spotlightDistance ?? 1000,
        angle: theme.spotlightAngle ?? Math.PI / 6,
        penumbra: theme.spotlightPenumbra ?? 0.1,
        position: new THREE.Vector3(3, 3, 2),
      });
      light1Ref.current = light1;

      // Second Spotlight
      const light2 = createSpotlight(scene, {
        color: theme.spotlightColor ?? 0xffffff,
        intensity: theme.spotlightIntensity ?? 1.5,
        distance: theme.spotlightDistance ?? 1000,
        angle: theme.spotlightAngle ?? Math.PI / 6,
        penumbra: theme.spotlightPenumbra ?? 0.1,
        position: new THREE.Vector3(-3, 3, 2),
      });
      light2Ref.current = light2;

      animate();
    };

    const animate = () => {
      requestAnimationFrame(animate);
      const delta = clock.getDelta();
      evolveSmoke(delta);
      renderer.render(scene, camera);
      updateOverlay();
    };

    const evolveSmoke = (delta: number) => {
      updateSmokeParticles(
        smokeParticles,
        { ...theme, smokeSpeed, smokeOpacity },
        delta,
        [light1Ref.current, light2Ref.current].filter((light): light is THREE.SpotLight => light !== null)
      );

      updateSpotlightSettings(light1Ref.current);
      updateSpotlightSettings(light2Ref.current);
    };

    const updateSpotlightSettings = (light: THREE.SpotLight | null) => {
      if (light) {
        light.color.set(theme.spotlightColor ?? 0xffffff);
        light.intensity = theme.spotlightEnabled ? (theme.spotlightIntensity ?? 1.5) : 0;
        light.angle = theme.spotlightAngle ?? Math.PI / 6;
        light.penumbra = theme.spotlightPenumbra ?? 0.1;
        light.distance = theme.spotlightDistance ?? 1500;
      }
    };

    const updateOverlay = () => {
      if (!overlay || !light1Ref.current) return;
      const light = light1Ref.current;
      const screenPosition = new THREE.Vector3();
      light.getWorldPosition(screenPosition);
      screenPosition.project(camera);
      const x = (screenPosition.x * 0.5 + 0.5) * window.innerWidth;
      const y = (screenPosition.y * -0.5 + 0.5) * window.innerHeight;
      overlay.style.background = `radial-gradient(
        circle at ${x}px ${y}px,
        rgba(${parseInt(light.color.getHexString().slice(0, 2), 16)},
             ${parseInt(light.color.getHexString().slice(2, 4), 16)},
             ${parseInt(light.color.getHexString().slice(4, 6), 16)},
             ${light.intensity * 0.2}) 0%,
        rgba(0,0,0,0) ${light.angle * 180 / Math.PI}%
      )`;
    };

    init();

    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, [theme, smokeSpeed, smokeOpacity]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full z-0 pointer-events-none"
      />
      <div
        ref={overlayRef}
        className="absolute top-0 left-0 w-full h-full z-5 pointer-events-none"
      />
    </>
  );
};

export default InteractiveSmokeBackground;
