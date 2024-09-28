"use client";

import { Avatar } from '@radix-ui/themes';
import { PreviewSection } from './PreviewSection';

export const AvatarPreview = () => {
  return (
    <PreviewSection title="Avatar Preview">
      <Avatar
        src="https://utfs.io/f/ifgrHpzuQlMxXnKhJs6h2TdP96Ejitz0LcHbY1Kqv4uwalGy/avatarTest.png"
        fallback="User"
        size="4"
        style={{
          backgroundColor: 'var(--accent-9)',
          color: 'var(--accent-contrast)',
        }}
      />
    </PreviewSection>
  );
};