import * as THREE from "three";

export const addGeneralLights = (scene: THREE.Scene) => {
  const light = new THREE.DirectionalLight(0xffffff, 0.5);
  light.position.set(-1, 0, 1);
  scene.add(light);
};