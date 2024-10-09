import React from 'react';
import { Box, Text } from '@radix-ui/themes';
import NavbarLogo from '@/components/webgl/NavbarLogo';
import { useThemeContext } from '@/context/ThemeContext';
import { PreviewSection } from './PreviewSection';

const WebGLTextPreview: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <PreviewSection title="Navbar Logo Preview">
      <Box style={{ height: '64px', width: '180px', textAlign: 'left' }}>
        <NavbarLogo />
      </Box>
      <Text size="1" style={{ marginTop: '8px' }}>
        Move your mouse over the text to see the interaction effect.
      </Text>
    </PreviewSection>
  );
};

export default WebGLTextPreview;