import { Particle, WebGLConfig } from '../types';

export function createParticles(
  particleCount: number,
  textCoordinates: { x: number; y: number }[],
  themeColor: [number, number, number, number],
  isLogo: boolean,
  config: WebGLConfig
): Particle[] {
  const particles: Particle[] = [];
  const totalCoordinates = textCoordinates.length;

  for (let i = 0; i < particleCount; i++) {
    let coord: { x: number; y: number };
    if (totalCoordinates > 0) {
      coord = textCoordinates[i % totalCoordinates] || { x: Math.random() * 800, y: Math.random() * 600 };
    } else {
      coord = { x: Math.random() * 800, y: Math.random() * 600 };
    }

    const size = config.minParticleSize + Math.random() * (config.maxParticleSize - config.minParticleSize);

    particles.push({
      x: coord.x,
      y: coord.y,
      baseX: coord.x,
      baseY: coord.y,
      vx: 0,
      vy: 0,
      baseColor: themeColor,
      color: [...themeColor],
      size: size,
      angle: Math.random() * Math.PI * 2,
      angularVelocity: (Math.random() - 0.5) * config.angularVelocity,
      life: 1,
    });
  }

  return particles;
}

export function updateParticles(
  particles: Particle[],
  mouse: { x: number; y: number; radius: number },
  config: WebGLConfig,
  deltaTime: number,
  textCoordinates: { x: number; y: number }[]
) {
  particles.forEach((particle) => {
    const dx = mouse.x - particle.x;
    const dy = mouse.y - particle.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    if (distance < mouse.radius) {
      const force = (mouse.radius - distance) / mouse.radius;
      const directionX = Math.cos(angle) * force * config.forceMultiplier;
      const directionY = Math.sin(angle) * force * config.forceMultiplier;

      const rotationForceX =
        Math.sin(
          -Math.cos(angle * -1) *
            Math.sin(config.rotationForceMultiplier * Math.cos(force)) *
            Math.sin(distance * distance) *
            Math.sin(angle * distance)
        );
      const rotationForceY =
        Math.sin(
          Math.cos(angle * 1) *
            Math.sin(config.rotationForceMultiplier * Math.sin(force)) *
            Math.sin(distance * distance) *
            Math.cos(angle * distance)
        );

      particle.vx -= directionX + rotationForceX;
      particle.vy -= directionY + rotationForceY;
    } else {
      particle.vx += (particle.baseX - particle.x) * config.returnSpeed;
      particle.vy += (particle.baseY - particle.y) * config.returnSpeed;
    }

    particle.x += particle.vx * deltaTime;
    particle.y += particle.vy * deltaTime;
    particle.vx *= config.velocityDamping;
    particle.vy *= config.velocityDamping;

    particle.color = particle.color.map((c, index) => {
      const baseC = particle.baseColor[index] ?? 0;
      const deviation = (Math.random() - 0.5) * config.colorMultiplier * deltaTime;
      const newC = baseC + deviation;
      return Math.max(0, Math.min(1, newC));
    }) as [number, number, number, number];

    particle.color[3] = 1;

    // Update size fluctuations
    const sizeFluctuation = Math.sin(Date.now() * config.sizeFluctuationSpeed) * config.sizeFluctuationAmount;
    particle.size = Math.max(
      config.minParticleSize,
      Math.min(config.maxParticleSize, particle.size + sizeFluctuation)
    );

    particle.angle += particle.angularVelocity * deltaTime;

  });
}

export function renderParticles(
  gl: WebGLRenderingContext,
  program: WebGLProgram,
  particles: Particle[],
  config: WebGLConfig
) {
  gl.useProgram(program);

  const positionBuffer = gl.createBuffer();
  const colorBuffer = gl.createBuffer();
  const sizeBuffer = gl.createBuffer();
  const angleBuffer = gl.createBuffer();

  const positions = new Float32Array(particles.flatMap((p) => [p.x, p.y]));
  const colors = new Float32Array(particles.flatMap((p) => p.color));
  const sizes = new Float32Array(particles.map((p) => p.size));
  const angles = new Float32Array(particles.map((p) => p.angle));

  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, sizes, gl.DYNAMIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, angleBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, angles, gl.DYNAMIC_DRAW);

  const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
  const colorAttributeLocation = gl.getAttribLocation(program, 'a_color');
  const sizeAttributeLocation = gl.getAttribLocation(program, 'a_size');
  const angleAttributeLocation = gl.getAttribLocation(program, 'a_angle');

  if (positionAttributeLocation === -1) console.error('Attribute a_position not found.');
  if (colorAttributeLocation === -1) console.error('Attribute a_color not found.');
  if (sizeAttributeLocation === -1) console.error('Attribute a_size not found.');
  if (angleAttributeLocation === -1) console.error('Attribute a_angle not found.');

  if (positionAttributeLocation !== -1) {
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);
  }

  if (colorAttributeLocation !== -1) {
    gl.enableVertexAttribArray(colorAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.vertexAttribPointer(colorAttributeLocation, 4, gl.FLOAT, false, 0, 0);
  }

  if (sizeAttributeLocation !== -1) {
    gl.enableVertexAttribArray(sizeAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, sizeBuffer);
    gl.vertexAttribPointer(sizeAttributeLocation, 1, gl.FLOAT, false, 0, 0);
  }

  if (angleAttributeLocation !== -1) {
    gl.enableVertexAttribArray(angleAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, angleBuffer);
    gl.vertexAttribPointer(angleAttributeLocation, 1, gl.FLOAT, false, 0, 0);
  }

  gl.drawArrays(gl.POINTS, 0, particles.length);

  gl.deleteBuffer(positionBuffer);
  gl.deleteBuffer(colorBuffer);
  gl.deleteBuffer(sizeBuffer);
  gl.deleteBuffer(angleBuffer);
}
