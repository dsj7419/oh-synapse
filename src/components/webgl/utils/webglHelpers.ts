import { type Theme } from '@/defaults/themeDefaults';

export function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

export function createProgram(gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Unable to initialize the shader program: ' + gl.getProgramInfoLog(program));
    return null;
  }
  return program;
}

interface TextConfig {
  text: string;
  fontSize: number;
  fontFamily: string;
  color: string;
}

export function createTextTexture(
  gl: WebGLRenderingContext,
  textConfig: TextConfig
): WebGLTexture | null {
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.font = `${textConfig.fontSize}px ${textConfig.fontFamily}`;
  const metrics = ctx.measureText(textConfig.text);
  canvas.width = metrics.width;
  canvas.height = textConfig.fontSize * 1.5;

  ctx.font = `${textConfig.fontSize}px ${textConfig.fontFamily}`;
  ctx.fillStyle = textConfig.color;
  ctx.textBaseline = 'top';
  ctx.fillText(textConfig.text, 0, 0);

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

  return texture;
}

export function createLogoTextTexture(gl: WebGLRenderingContext, theme: Theme): WebGLTexture | null {
  return createTextTexture(gl, {
    text: theme.webglLogoText,
    fontSize: theme.webglLogoFontSize,
    fontFamily: theme.webglLogoFontFamily,
    color: theme.webglLogoColor
  });
}

export function createLargeTextTexture(gl: WebGLRenderingContext, theme: Theme, currentText: string): WebGLTexture | null {
  return createTextTexture(gl, {
    text: currentText,
    fontSize: theme.webglLargeFontSize,
    fontFamily: theme.webglLargeFontFamily,
    color: theme.webglLargeColor
  });
}