import { createShader } from "./webglHelpers";

export const initWebGL = (canvas: HTMLCanvasElement): WebGLRenderingContext | null => {
    try {
      const gl = canvas.getContext('webgl');
      if (!gl) {
        throw new Error('WebGL not supported');
      }
      return gl;
    } catch (error) {
      console.error('Error initializing WebGL:', error);
      return null;
    }
};

export const createShaderProgram = (
    gl: WebGLRenderingContext,
    vertexSource: string,
    fragmentSource: string
): WebGLProgram | null => {
    try {
      const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexSource);
      const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentSource);
  
      if (!vertexShader || !fragmentShader) {
        console.error('Failed to create shaders');
        return null;
      }
  
      const program = gl.createProgram();
      if (!program) {
        console.error('Failed to create program');
        return null;
      }
  
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
  
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Unable to initialize the shader program:', gl.getProgramInfoLog(program));
        return null;
      }

      console.log('Shader program successfully linked.');
      return program;
    } catch (error) {
      console.error('Error creating shader program:', error);
      return null;
    }
};
