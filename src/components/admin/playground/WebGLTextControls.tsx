import React from 'react';
import { ThemePluginProps, registerThemePlugin } from './ThemePluginArchitecture';
import { Box, Flex, Text, Slider, TextField, Select } from '@radix-ui/themes';
import { THEME_DEFAULTS, Theme } from '@/defaults/themeDefaults';

const WebGLTextControls: React.FC<ThemePluginProps> = ({ theme, onThemeChange }) => {
  const handleChange = (updates: Partial<Theme>) => {
    onThemeChange(updates);
  };

  const handleFontSizeChange = (value: number[], type: 'logo' | 'large') => {
    if (type === 'logo') {
      handleChange({ webglLogoFontSize: value[0] });
    } else {
      handleChange({ webglLargeFontSize: value[0] });
    }
  };

  const handleColorChange = (color: string, type: 'logo' | 'large') => {
    if (type === 'logo') {
      handleChange({ webglLogoColor: color });
    } else {
      handleChange({ webglLargeColor: color });
    }
  };

  const handleFontFamilyChange = (value: string, type: 'logo' | 'large') => {
    if (type === 'logo') {
      handleChange({ webglLogoFontFamily: value });
    } else {
      handleChange({ webglLargeFontFamily: value });
    }
  };

  return (
    <Box>
      <Text size="3" mb="2" weight="bold">WebGL Text Controls</Text>
      <Flex direction="column" gap="4">
        <Box>
          <Text as="label" size="2">Logo Text</Text>
          <TextField.Root
            value={theme.webglLogoText}
            onChange={(e) => handleChange({ webglLogoText: e.target.value })}
            placeholder="Logo Text"
          />
        </Box>
        <Box>
          <Text as="label" size="2">Large Text</Text>
          <TextField.Root
            value={theme.webglLargeText}
            onChange={(e) => handleChange({ webglLargeText: e.target.value })}
            placeholder="Large Text (JSON string array)"
          />
        </Box>
        <Box>
          <Text as="label" size="2">Logo Font Size</Text>
          <Slider
            value={[theme.webglLogoFontSize ?? THEME_DEFAULTS.webglLogoFontSize]}
            onValueChange={(value) => handleFontSizeChange(value, 'logo')}
            min={10}
            max={100}
            step={1}
          />
        </Box>
        <Box>
          <Text as="label" size="2">Large Text Font Size</Text>
          <Slider
            value={[theme.webglLargeFontSize ?? THEME_DEFAULTS.webglLargeFontSize]}
            onValueChange={(value) => handleFontSizeChange(value, 'large')}
            min={10}
            max={100}
            step={1}
          />
        </Box>
        <Box>
          <Text as="label" size="2">Logo Color</Text>
          <input
            type="color"
            value={theme.webglLogoColor ?? THEME_DEFAULTS.webglLogoColor}
            onChange={(e) => handleColorChange(e.target.value, 'logo')}
            style={{ width: '100%', height: '30px' }}
          />
        </Box>
        <Box>
          <Text as="label" size="2">Large Text Color</Text>
          <input
            type="color"
            value={theme.webglLargeColor ?? THEME_DEFAULTS.webglLargeColor}
            onChange={(e) => handleColorChange(e.target.value, 'large')}
            style={{ width: '100%', height: '30px' }}
          />
        </Box>
        <Box>
          <Text as="label" size="2">Logo Font Family</Text>
          <Select.Root
            value={theme.webglLogoFontFamily ?? THEME_DEFAULTS.webglLogoFontFamily}
            onValueChange={(value) => handleFontFamilyChange(value, 'logo')}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="Arial">Arial</Select.Item>
              <Select.Item value="Helvetica">Helvetica</Select.Item>
              <Select.Item value="Times New Roman">Times New Roman</Select.Item>
              <Select.Item value="Courier">Courier</Select.Item>
            </Select.Content>
          </Select.Root>
        </Box>
        <Box>
          <Text as="label" size="2">Large Text Font Family</Text>
          <Select.Root
            value={theme.webglLargeFontFamily ?? THEME_DEFAULTS.webglLargeFontFamily}
            onValueChange={(value) => handleFontFamilyChange(value, 'large')}
          >
            <Select.Trigger />
            <Select.Content>
              <Select.Item value="Arial">Arial</Select.Item>
              <Select.Item value="Helvetica">Helvetica</Select.Item>
              <Select.Item value="Times New Roman">Times New Roman</Select.Item>
              <Select.Item value="Courier">Courier</Select.Item>
            </Select.Content>
          </Select.Root>
        </Box>
        <Box>
          <Text as="label" size="2">Logo Animation Speed</Text>
          <Slider
            value={[theme.webglLogoAnimSpeed ?? THEME_DEFAULTS.webglLogoAnimSpeed]}
            onValueChange={(value) => handleChange({ webglLogoAnimSpeed: value[0] })}
            min={0}
            max={10}
            step={0.1}
          />
        </Box>
        <Box>
          <Text as="label" size="2">Large Text Animation Speed</Text>
          <Slider
            value={[theme.webglLargeAnimSpeed ?? THEME_DEFAULTS.webglLargeAnimSpeed]}
            onValueChange={(value) => handleChange({ webglLargeAnimSpeed: value[0] })}
            min={0}
            max={10}
            step={0.1}
          />
        </Box>
        <Box>
          <Text as="label" size="2">Logo Interaction Radius</Text>
          <Slider
            value={[theme.webglLogoInterRadius ?? THEME_DEFAULTS.webglLogoInterRadius]}
            onValueChange={(value) => handleChange({ webglLogoInterRadius: value[0] })}
            min={0}
            max={100}
            step={1}
          />
        </Box>
        <Box>
          <Text as="label" size="2">Large Text Interaction Radius</Text>
          <Slider
            value={[theme.webglLargeInterRadius ?? THEME_DEFAULTS.webglLargeInterRadius]}
            onValueChange={(value) => handleChange({ webglLargeInterRadius: value[0] })}
            min={0}
            max={100}
            step={1}
          />
        </Box>
        <Box>
          <Text as="label" size="2">Large Text Change Interval</Text>
          <Slider
            value={[theme.webglLargeChangeInterval ?? THEME_DEFAULTS.webglLargeChangeInterval]}
            onValueChange={(value) => handleChange({ webglLargeChangeInterval: value[0] })}
            min={1000}
            max={10000}
            step={100}
          />
        </Box>
      </Flex>
    </Box>
  );
};

registerThemePlugin({
  name: 'WebGLTextControls',
  component: WebGLTextControls,
});

export default WebGLTextControls;