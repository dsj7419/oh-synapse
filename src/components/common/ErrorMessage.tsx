import React from 'react';
import { Text, Box } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface ErrorMessageProps {
  message: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  const { theme } = useThemeContext();

  if (!message) return null;

  return (
    <Box
      style={{
        backgroundColor: 'var(--red-3)',
        borderRadius: `var(--radius-${theme.radius})`,
        padding: 'var(--space-2)',
        marginTop: 'var(--space-2)',
      }}
    >
      <Text size="2" style={{ color: 'var(--red-11)' }}>
        {message}
      </Text>
    </Box>
  );
};

export default ErrorMessage;