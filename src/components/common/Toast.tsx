import React, { useState, useEffect } from 'react';
import { Box, Text } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  duration?: number;
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000 }) => {
  const [isVisible, setIsVisible] = useState(true);
  const { theme } = useThemeContext();

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  if (!isVisible) return null;

  return (
    <Box
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        padding: '10px 20px',
        borderRadius: `var(--radius-${theme.radius})`,
        backgroundColor: type === 'success' ? `var(--${theme.accentColor}-9)` : 'var(--color-error)',
        color: 'var(--color-background)',
        zIndex: 1000,
      }}
    >
      <Text>{message}</Text>
    </Box>
  );
};

export default Toast;