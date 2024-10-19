import React, { useEffect, useRef } from "react";
import { initWebGL, createShaderProgram } from "../utils/webglShaderUtils";
import {
  vertexShaderSource,
  fragmentShaderSource,
} from "../shaders/shaderSources";
import { type WebGLRendererProps } from "../types";

const WebGLRenderer: React.FC<WebGLRendererProps> = ({
  width,
  height,
  render,
  canvasRef,
  setGL,
  setProgram,
  isWindowFocused,
}) => {
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const lastTimeRef = useRef<number>(0);
  const requestIdRef = useRef<number>();
  const renderRef = useRef(render);

  useEffect(() => {
    renderRef.current = render;
  }, [render]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Canvas element not found");
      return;
    }

    // Initialize WebGL context
    const gl = initWebGL(canvas);
    if (!gl) {
      console.error("WebGL context initialization failed");
      return;
    }
    console.log("WebGL context initialized", gl);
    glRef.current = gl;
    setGL(gl);

    // Create and link shader program
    const program = createShaderProgram(
      gl,
      vertexShaderSource,
      fragmentShaderSource,
    );
    if (!program) {
      console.error("Shader program creation failed");
      return;
    }
    console.log("Shader program successfully linked.");
    programRef.current = program;
    setProgram(program);

    gl.useProgram(program);
    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution",
    );
    gl.uniform2f(resolutionUniformLocation, width, height);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.clearColor(0, 0, 0, 0);

    const animate = (currentTime: number) => {
      if (isWindowFocused.current) {
        const deltaTime = (currentTime - lastTimeRef.current) / 1000;
        lastTimeRef.current = currentTime;
        gl.clear(gl.COLOR_BUFFER_BIT);
        renderRef.current(gl, program, deltaTime, currentTime);
      }
      requestIdRef.current = requestAnimationFrame(animate);
    };

    requestIdRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestIdRef.current) {
        cancelAnimationFrame(requestIdRef.current);
      }
      if (gl && program) {
        gl.deleteProgram(program);
      }
    };
  }, [width, height, setGL, setProgram, isWindowFocused]);

  useEffect(() => {
    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    gl.viewport(0, 0, width, height);
    // Update resolution uniform
    const resolutionUniformLocation = gl.getUniformLocation(
      program,
      "u_resolution",
    );
    gl.useProgram(program);
    gl.uniform2f(resolutionUniformLocation, width, height);
  }, [width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default WebGLRenderer;
