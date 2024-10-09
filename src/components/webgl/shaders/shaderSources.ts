export const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec4 a_color;
  attribute float a_angle;
  attribute float a_size; // Add this line
  uniform vec2 u_resolution;
  varying vec4 v_color;
  varying float v_angle;

  void main() {
    // Convert the position from pixels to 0.0 to 1.0
    vec2 zeroToOne = a_position / u_resolution;

    // Convert from 0->1 to 0->2
    vec2 zeroToTwo = zeroToOne * 2.0;

    // Convert from 0->2 to -1->+1 (clipspace)
    vec2 clipSpace = zeroToTwo - 1.0;

    // Flip Y to match canvas coordinate system
    gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);

    // Set the point size
    gl_PointSize = a_size; // Use the a_size attribute

    // Pass the color to the fragment shader
    v_color = a_color;

    // Pass the angle to the fragment shader
    v_angle = a_angle;
  }
`;


export const fragmentShaderSource = `
  precision mediump float;

  varying vec4 v_color;
  varying float v_angle;

  uniform float u_time;

  void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float distance = length(coord);

    // Rotate the particle
    float c = cos(v_angle);
    float s = sin(v_angle);
    vec2 rotatedCoord = vec2(
      coord.x * c - coord.y * s,
      coord.x * s + coord.y * c
    );

    // Create a soft edge
    float alpha = 1.0 - smoothstep(0.4, 0.5, distance);

    // Add some texture to the particle
    float noise = fract(sin(dot(rotatedCoord, vec2(12.9898, 78.233))) * 43758.5453);
    
    // Mix noise with base color
    vec3 color = mix(v_color.rgb, vec3(noise), 0.1);

    // Add time-based color variation
    color += vec3(sin(u_time), cos(u_time), sin(u_time * 0.5)) * 0.1;

    gl_FragColor = vec4(color, v_color.a * alpha);
  }
`;