import React from 'react';
import { Box, Text } from '@radix-ui/themes';
import LargeTextDisplay from '@/components/webgl/LargeTextDisplay';
import { useThemeContext } from '@/context/ThemeContext';
import { PreviewSection } from './PreviewSection';

const WebGLLargeTextPreview: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <PreviewSection title="Large Text Preview">
      <Box style={{ height: '200px', width: '900px', textAlign: 'center' }}>
        <LargeTextDisplay dimensions={{ width: 600, height: 200 }} />
      </Box>
      <Text size="1" style={{ marginTop: '8px' }}>
        Move your mouse over the text to see the interaction effect.
        The text will change every {theme.webglLargeChangeInterval / 1000} seconds.
      </Text>
    </PreviewSection>
  );
};

export default WebGLLargeTextPreview;
