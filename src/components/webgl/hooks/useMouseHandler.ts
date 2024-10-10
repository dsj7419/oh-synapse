import { useEffect, useState, RefObject, useRef } from "react";

type Mouse = {
    x: number;
    y: number;
    radius: number;
};

export function useMouseHandler(
  canvasRef: RefObject<HTMLCanvasElement>,
  initialRadius = 100
) {
  const mouseRef = useRef({ x: -500, y: -500, radius: initialRadius });
  const isWindowFocused = useRef(true); 

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (canvasRef.current && isWindowFocused.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        mouseRef.current.x = event.clientX - rect.left;
        mouseRef.current.y = event.clientY - rect.top;
      }
    };

    const handleMouseLeave = () => {
      mouseRef.current.x = -500;
      mouseRef.current.y = -500;
    };

    const handleFocus = () => {
      isWindowFocused.current = true;
    };

    const handleBlur = () => {
      isWindowFocused.current = false;
      mouseRef.current.x = -500;
      mouseRef.current.y = -500;
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('mousemove', handleMouseMove);
      canvas.addEventListener('mouseleave', handleMouseLeave);
      window.addEventListener('focus', handleFocus);
      window.addEventListener('blur', handleBlur);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('mousemove', handleMouseMove);
        canvas.removeEventListener('mouseleave', handleMouseLeave);
        window.removeEventListener('focus', handleFocus);
        window.removeEventListener('blur', handleBlur);
      }
    };
  }, [canvasRef]);

  return mouseRef;
}
