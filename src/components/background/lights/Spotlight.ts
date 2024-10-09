import * as THREE from "three";

export const createSpotlight = (
  scene: THREE.Scene,
  {
    color,
    intensity,
    distance,
    angle,
    penumbra,
    position,
  }: {
    color: string | number;
    intensity: number;
    distance: number;
    angle: number;
    penumbra: number;
    position: THREE.Vector3;
  }
): THREE.SpotLight => {
  const spotlight = new THREE.SpotLight(color, intensity, distance);
  spotlight.position.copy(position);
  spotlight.angle = angle;
  spotlight.penumbra = penumbra;
  spotlight.castShadow = true;
  spotlight.decay = 2.0;

  const target = new THREE.Object3D();
  target.position.set(0, 0, 0);
  scene.add(target);
  spotlight.target = target;

  scene.add(spotlight);

  return spotlight;
};

export const updateMovingSpotlight = (
  spotlight: THREE.SpotLight,
  mouse: { x: number; y: number },
  viewport: { width: number; height: number }
) => {
  const targetPosition = new THREE.Vector3(
    (mouse.x * viewport.width) / 2,
    (mouse.y * viewport.height) / 2,
    0
  );
  spotlight.target.position.lerp(targetPosition, 0.1);
  spotlight.target.updateMatrixWorld();
};