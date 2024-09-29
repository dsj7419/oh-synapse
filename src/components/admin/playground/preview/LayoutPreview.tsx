"use client";

import { Box, Text } from '@radix-ui/themes';
import type { Theme } from '@/defaults/themeDefaults';

interface LayoutPreviewProps {
  theme: Theme; 
}

const LayoutPreview = ({ theme }: LayoutPreviewProps) => {
  const isGrid = theme.layout === 'Grid';

  return (
    <Box style={{ maxWidth: '400px', padding: '8px', backgroundColor: 'var(--color-background)', borderRadius: '8px', marginLeft: '0' }}>
      <Text size="3" weight="medium" style={{ color: 'var(--color-text)', marginBottom: '8px', textAlign: 'left' }}>
        Layout Preview
      </Text>

      <Box
        style={{
          display: isGrid ? 'grid' : 'block',
          gridTemplateColumns: isGrid ? 'repeat(3, 100px)' : 'none', 
          gap: '8px', 
          marginTop: '8px',
          textAlign: 'left', 
        }}
      >
        {/* Preview items */}
        <Box
          className="preview-item"
          style={{
            width: '100px', 
            padding: '8px',
            backgroundColor: 'var(--gray-2)',
            borderRadius: '6px',
            textAlign: 'center',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)', 
            color: 'var(--color-text)',
            fontSize: '0.875rem', 
          }}
        >
          Item 1
        </Box>
        <Box
          className="preview-item"
          style={{
            width: '100px', 
            padding: '8px',
            backgroundColor: 'var(--gray-3)',
            borderRadius: '6px',
            textAlign: 'center',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            color: 'var(--color-text)',
            fontSize: '0.875rem',
          }}
        >
          Item 2
        </Box>
        <Box
          className="preview-item"
          style={{
            width: '100px',
            padding: '8px',
            backgroundColor: 'var(--gray-4)',
            borderRadius: '6px',
            textAlign: 'center',
            boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
            color: 'var(--color-text)',
            fontSize: '0.875rem',
          }}
        >
          Item 3
        </Box>
      </Box>
    </Box>
  );
};

export default LayoutPreview;
