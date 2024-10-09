import * as THREE from "three";
import { FluidSimulator } from "./FluidSimulator";
import { SettingsManager } from "./SettingsManager";
import { createSpotlight } from "../lights/Spotlight";
import { createSmokeParticles, updateSmokeParticles, SmokeParticle } from "./SmokeParticles";
import { Theme } from "@/defaults/themeDefaults";

export class SmokeRenderer {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  fluidSimulator: FluidSimulator;
  settingsManager: SettingsManager;
  canvas: HTMLCanvasElement;
  smokeParticles: SmokeParticle[];
  spotlight: THREE.SpotLight | null = null;

  constructor(canvas: HTMLCanvasElement, fluidSimulator: FluidSimulator, settingsManager: SettingsManager) {
    this.canvas = canvas;
    this.fluidSimulator = fluidSimulator;
    this.settingsManager = settingsManager;
    this.renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 10000);
    this.camera.position.z = 1000;
    this.smokeParticles = [];
  }

  init() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    
    // Convert SettingsManager to Partial<Theme>
    const themeSettings: Partial<Theme> = {
      accentColor: this.settingsManager.accentColor,
      smokeOpacity: this.settingsManager.smokeOpacity,
    };
    
    this.smokeParticles = createSmokeParticles(this.scene, themeSettings);

    const light = new THREE.DirectionalLight(0xffffff, 0.5);
    light.position.set(-1, 0, 1);
    this.scene.add(light);

    this.spotlight = createSpotlight(this.scene, {
      color: this.settingsManager.accentColor,
      intensity: this.settingsManager.spotlightIntensity,
      distance: this.settingsManager.spotlightDistance,
      angle: this.settingsManager.spotlightAngle,
      penumbra: this.settingsManager.spotlightPenumbra,
      position: new THREE.Vector3(3, 3, 2),
    });

    this.animate();
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));
    
    const themeSettings: Partial<Theme> = {
      accentColor: this.settingsManager.accentColor,
      smokeOpacity: this.settingsManager.smokeOpacity,
      smokeSpeed: this.settingsManager.smokeSpeed,
    };

    updateSmokeParticles(
      this.smokeParticles,
      themeSettings,
      this.fluidSimulator.clock.getDelta(),
      this.spotlight ? [this.spotlight] : []
    );

    this.renderer.render(this.scene, this.camera);
  }

  cleanup() {
    this.renderer.dispose();
  }
}