import * as THREE from "three";

export const initializeScene = (
  canvas: HTMLCanvasElement,
  camera: THREE.PerspectiveCamera,
  scene: THREE.Scene
): THREE.WebGLRenderer => {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  // Setup Camera
  camera.position.z = 1000;
  scene.add(camera);

  // Handle window resize
  window.addEventListener("resize", () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
  });

  return renderer;
};