import * as THREE from 'three';

export class FluidSimulator {
  particles: THREE.Mesh[] = [];
  clock = new THREE.Clock();
  
  initParticles(particleCount: number, geometry: THREE.PlaneGeometry, material: THREE.Material) {
    for (let i = 0; i < particleCount; i++) {
      const particle = new THREE.Mesh(geometry, material);
      particle.position.set(Math.random() * 800 - 400, Math.random() * 800 - 400, Math.random() * 1000 - 100);
      particle.rotation.z = Math.random() * 360;
      this.particles.push(particle);
    }
  }

  updateParticles(smokeSpeed: number) {
    const delta = this.clock.getDelta();
    this.particles.forEach(particle => {
      particle.rotation.z += smokeSpeed * delta; 
    });
  }
}