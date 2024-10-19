import { type Theme } from '@/defaults/themeDefaults';

export function getTextCoordinates(
  gl: WebGLRenderingContext,
  text: string[],
  width: number,
  height: number,
  isLogo: boolean,
  theme: Theme,
  fontSize: number,
  fontFamily: string,
  color: string
): { x: number; y: number }[] {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) {
    console.error('Failed to get 2D context');
    return [];
  }

  ctx.canvas.width = width;
  ctx.canvas.height = height;
  ctx.clearRect(0, 0, width, height);

  ctx.font = `${fontSize}px ${fontFamily}`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const lineHeight = fontSize * 1.2;
  const totalTextHeight = lineHeight * text.length;
  const startY = (height - totalTextHeight) / 2 + lineHeight / 2;

  text.forEach((line, index) => {
    ctx.fillText(line, width / 2, startY + index * lineHeight);
  });

  const imageData = ctx.getImageData(0, 0, width, height).data;
  const coordinates: { x: number; y: number }[] = [];
  const step = isLogo ? 2 : 1;

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const index = (y * width + x) * 4;
      if ((imageData?.[index + 3] ?? -1) > 128) {
        coordinates.push({
          x: x,
          y: y,
        });
      }
    }
  }

  return coordinates;
}