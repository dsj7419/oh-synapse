// src/components/pages/HomePage.tsx

"use client";

import { useThemeContext } from '@/context/ThemeContext';
import Link from 'next/link';
import { Box, Button, Text, Heading } from '@radix-ui/themes';

const HomePage = () => {
  const { theme } = useThemeContext();

  return (
    <Box
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        fontFamily: theme.font,
      }}
    >
      <Box className="max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8">
        <Box className="text-center">
        <Heading
          as="h1"
          size={{ initial: '8', sm: '9', md: '9' }} // Adjusted size to '9'
          weight="bold"
          style={{ color: 'var(--color-text)' }}
        >
          Only Human
          <br />
          <span style={{ color: 'var(--accent-9)' }}>Synapse Warband</span>
        </Heading>
          <Text
            size={{ initial: '4', sm: '5' }}
            className="mt-3 max-w-md mx-auto md:mt-5 md:max-w-3xl"
            style={{ color: 'var(--color-text)' }}
          >
            Official Website for the Once Human Warband, Synapse!
          </Text>
          <Box className="mt-5 flex justify-center space-x-4 md:mt-8">
            <Button
              asChild
              variant="solid"
              size="3"
              style={{
                borderRadius: `var(--radius-${theme.radius})`,
                backgroundColor: 'var(--accent-9)',
                color: 'var(--accent-contrast)',
              }}
            >
              <Link href="/recipes">View Recipes</Link>
            </Button>
            <Button
              asChild
              variant="soft"
              size="3"
              style={{
                borderRadius: `var(--radius-${theme.radius})`,
                backgroundColor: 'var(--color-panel)',
                color: 'var(--color-text)',
              }}
            >
              <Link href="/admin">Admin Panel</Link>
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;