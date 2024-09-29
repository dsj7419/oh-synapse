"use client";

import { ButtonPreview } from './ButtonPreview';
import { AvatarPreview } from './AvatarPreview';
import { BadgePreview } from './BadgePreview';
import { CardPreview } from './CardPreview';
import { CheckboxPreview } from './CheckboxPreview';
import { BlockquotePreview } from './BlockquotePreview';
import LayoutPreview from './LayoutPreview';
import { Box } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

export const PlaygroundPreview = () => {
  const { theme } = useThemeContext();

  return (
    <Box p="4" style={{ minHeight: '100vh' }}>
      <h2 className="text-2xl font-bold">Live Preview</h2>
      <ButtonPreview />
      <AvatarPreview />
      <BadgePreview theme={theme} />
      <CardPreview theme={theme} />
      <CheckboxPreview theme={theme} />
      <BlockquotePreview theme={theme} />
      <LayoutPreview theme={theme} />
    </Box>
  );
};
