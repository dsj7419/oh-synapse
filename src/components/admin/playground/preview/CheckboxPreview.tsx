"use client";

import { Checkbox, Flex } from '@radix-ui/themes';
import * as LabelPrimitive from '@radix-ui/react-label';
import { PreviewSection } from './PreviewSection';

export const CheckboxPreview = () => {
  return (
    <PreviewSection title="Checkbox Preview">
      <Flex align="center" gap="2">
        <Checkbox id="themed-checkbox" defaultChecked />
        <LabelPrimitive.Root
          htmlFor="themed-checkbox"
          style={{ color: 'var(--color-text)', cursor: 'pointer' }}
        >
          Themed Checkbox
        </LabelPrimitive.Root>
      </Flex>
    </PreviewSection>
  );
};
