import React, { useRef, useLayoutEffect, useState } from 'react';
import { useThemeContext } from '@/context/ThemeContext';
import EnhancedWebGLText from './components/EnhancedWebGLText';

interface LargeTextDisplayProps {
  dimensions?: { width: number; height: number };
}

const LargeTextDisplay: React.FC<LargeTextDisplayProps> = ({ dimensions }) => {
  console.log('LargeTextDisplay: Component rendering');

  const { theme } = useThemeContext();
  const containerRef = useRef<HTMLDivElement>(null);
  const [calculatedDimensions, setCalculatedDimensions] = useState<{ width: number; height: number } | null>(null);

  useLayoutEffect(() => {
    if (!dimensions && containerRef.current) {
      const containerWidth = containerRef.current.offsetWidth || window.innerWidth;
      const containerHeight = Math.max(200, window.innerHeight * 0.4);
      setCalculatedDimensions({
        width: containerWidth,
        height: containerHeight,
      });
      console.log('LargeTextDisplay: Calculated dimensions', { containerWidth, containerHeight });
    }
  }, [dimensions]);

  const finalDimensions = dimensions || calculatedDimensions;

  if (!finalDimensions || finalDimensions.width === 0 || finalDimensions.height === 0) {
    console.warn('LargeTextDisplay: Skipping render due to invalid dimensions');
    return null;
  }

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: `${finalDimensions.height}px`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <EnhancedWebGLText
        width={finalDimensions.width}
        height={finalDimensions.height}
        isLogo={false}
        theme={theme}
      />
    </div>
  );
};

export default LargeTextDisplay;
