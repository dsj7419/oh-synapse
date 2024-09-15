// Example for ButtonPreview.tsx

import { Button, Flex } from '@radix-ui/themes';
import { PreviewSection } from './PreviewSection';

export const ButtonPreview = () => {
  return (
    <PreviewSection title="Button Preview">
      <Flex gap="4" wrap="wrap">
        <Button variant="solid">Solid Button</Button>
        <Button variant="soft">Soft Button</Button>
        <Button variant="outline">Outline Button</Button>
        <Button variant="ghost">Ghost Button</Button>
      </Flex>
    </PreviewSection>
  );
};
