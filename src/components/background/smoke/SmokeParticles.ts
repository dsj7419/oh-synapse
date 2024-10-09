import * as THREE from "three";
import { Theme } from "@/defaults/themeDefaults";

const MAX_PARTICLES = 150;
const PARTICLE_LIFECYCLE = 8;

export interface SmokeParticle extends THREE.Object3D {
  material: THREE.MeshPhongMaterial;
  geometry: THREE.PlaneGeometry;
  velocity: THREE.Vector3;
  age: number;
  maxLife: number;
}

export const createSmokeParticles = (
  container: THREE.Object3D,
  theme: Partial<Theme>
): SmokeParticle[] => {
  const smokeTexture = new THREE.TextureLoader().load("https://s3-us-west-2.amazonaws.com/s.cdpn.io/95637/Smoke-Element.png");
  const smokeGeo = new THREE.PlaneGeometry(300, 300);
  const smokeParticles: SmokeParticle[] = [];

  for (let p = 0; p < MAX_PARTICLES; p++) {
    const smokeMaterial = new THREE.MeshPhongMaterial({
      color: theme.accentColor,
      emissive: new THREE.Color(theme.accentColor).multiplyScalar(0.5),
      map: smokeTexture,
      transparent: true,
      opacity: 0,
    });

    const particle: SmokeParticle = new THREE.Object3D() as SmokeParticle;
    particle.material = smokeMaterial;
    particle.geometry = smokeGeo;
    particle.velocity = new THREE.Vector3();
    particle.age = 0;
    particle.maxLife = 0;

    const mesh = new THREE.Mesh(smokeGeo, smokeMaterial);
    particle.add(mesh);

    resetParticle(particle, theme);
    container.add(particle);
    smokeParticles.push(particle);
  }

  return smokeParticles;
};

const resetParticle = (particle: SmokeParticle, theme: Partial<Theme>) => {
  particle.position.set(
    Math.random() * 500 - 250,
    Math.random() * 500 - 250,
    Math.random() * 1000 - 100
  );
  particle.rotation.z = Math.random() * Math.PI * 2;
  particle.velocity.set(
    Math.random() * 2 - 1,
    Math.random() * 2 - 1,
    Math.random() * 2 - 1
  );
  particle.age = 0;
  particle.maxLife = PARTICLE_LIFECYCLE * (0.75 + Math.random() * 0.5); 
  particle.material.opacity = 0;
};

export const updateSmokeParticles = (
  particles: SmokeParticle[],
  theme: Partial<Theme>,
  delta: number,
  spotlights: THREE.SpotLight[]
) => {
  const baseSpeed = (theme.smokeSpeed ?? 0.2) * 100;
  particles.forEach((particle) => {
    particle.age += delta;

    if (particle.age > particle.maxLife) {
      resetParticle(particle, theme);
    } else {
      // Move the particle
      particle.position.addScaledVector(particle.velocity, baseSpeed * delta);

      // Rotate the particle
      particle.rotation.z += delta * baseSpeed * 0.1;

      // Wrap particles around the scene
      if (particle.position.x < -250) particle.position.x = 250;
      if (particle.position.x > 250) particle.position.x = -250;
      if (particle.position.y < -250) particle.position.y = 250;
      if (particle.position.y > 250) particle.position.y = -250;
      if (particle.position.z < -100) particle.position.z = 900;
      if (particle.position.z > 900) particle.position.z = -100;

      // Apply spotlight effects
      let totalSpotlightEffect = 0;
      spotlights.forEach(spotlight => {
        totalSpotlightEffect += calculateSpotlightEffect(particle.position, spotlight);
      });

      // Update opacity with fade in/out effect
      const lifecycleProgress = particle.age / particle.maxLife;
      const fadeInOutFactor = Math.sin(lifecycleProgress * Math.PI);
      particle.material.opacity = (theme.smokeOpacity ?? 0.3) * fadeInOutFactor * (1 + totalSpotlightEffect * 0.5);

      // Update color based on theme
      const baseColor = new THREE.Color(theme.accentColor ?? 0x00dddd);
      const hsl = { h: 0, s: 0, l: 0 };
      baseColor.getHSL(hsl);

      // Apply saturation and lightness adjustments
      hsl.s = Math.max(0, Math.min(1, hsl.s * (theme.saturationAdjust ?? 1)));
      hsl.l = Math.max(0, Math.min(1, hsl.l * (theme.lightnessAdjust ?? 1)));

      // Set the adjusted color
      particle.material.color.setHSL(hsl.h, hsl.s, hsl.l);

      // Adjust emissive color for more vivid effect
      particle.material.emissive.setHSL(hsl.h, hsl.s, hsl.l * 0.5);
    }
  });
};

const calculateSpotlightEffect = (particlePosition: THREE.Vector3, spotlight: THREE.SpotLight): number => {
  const spotlightDirection = new THREE.Vector3().subVectors(particlePosition, spotlight.position).normalize();
  const spotlightAngle = Math.acos(spotlightDirection.dot(spotlight.getWorldDirection(new THREE.Vector3())));
  const distance = particlePosition.distanceTo(spotlight.position);
  const angleEffect = 1 - Math.min(spotlightAngle / spotlight.angle, 1);
  const distanceEffect = 1 - Math.min(distance / spotlight.distance, 1);
  return angleEffect * distanceEffect * spotlight.intensity * 0.3;
};