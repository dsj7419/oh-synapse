// src/components/admin/playground/RadiusPicker.tsx

"use client";

import { useState } from 'react';
import type { Theme } from '@/defaults/themeDefaults';
import { Box, Flex, Text } from '@radix-ui/themes';

interface RadiusPickerProps {
  theme: Pick<Theme, 'radius'>;
  onRadiusChange: (radius: Theme['radius']) => void;
}

const RADII: Theme['radius'][] = ['none', 'small', 'medium', 'large', 'full'];

const RadiusPicker = ({ theme, onRadiusChange }: RadiusPickerProps) => {
  const [selectedRadius, setSelectedRadius] = useState(theme.radius);

  const handleRadiusSelect = (radius: Theme['radius']) => {
    setSelectedRadius(radius);
    onRadiusChange(radius);
  };

  return (
    <div>
      <h4 className="text-md font-medium text-center">Border Radius</h4>
      <div
        role="group"
        aria-labelledby="radius-title"
        className="grid grid-cols-5 gap-2 mt-3"
      >
        {RADII.map((radius) => (
          <Flex
            key={radius}
            direction="column"
            align="center"
            className="cursor-pointer"
          >
            <label>
              <input
                type="radio"
                name="radius"
                value={radius}
                checked={selectedRadius === radius}
                onChange={() => handleRadiusSelect(radius)}
                className="sr-only"
              />
              <Box
                style={{
                  width: '32px',
                  height: '32px',
                  borderTopLeftRadius:
                    radius === 'full' ? '80%' : 'var(--radius-5)',
                  backgroundImage:
                    'linear-gradient(to bottom right, var(--accent-3), var(--accent-4))',
                  borderTop: '2px solid var(--accent-a8)',
                  borderLeft: '2px solid var(--accent-a8)',
                  margin: '8px',
                }}
                className={`${
                  selectedRadius === radius ? 'ring-2 ring-black' : ''
                }`}
              />
            </label>
            <Text size="1" style={{ paddingTop: '4px' }}>
              {radius.charAt(0).toUpperCase() + radius.slice(1)}
            </Text>
          </Flex>
        ))}
      </div>
    </div>
  );
};

export default RadiusPicker;
