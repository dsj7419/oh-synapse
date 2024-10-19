import React from 'react';
import { Box } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

const LoadingSpinner: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <Box
      style={{
        display: 'inline-block',
        width: '20px',
        height: '20px',
        border: '2px solid var(--gray-3)',
        borderTopColor: 'var(--blue-9)',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
      }}
    />
  );
};

export default LoadingSpinner;