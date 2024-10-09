"use client";

import { useThemeContext } from '@/context/ThemeContext';
import Link from 'next/link';
import { Box, Button, Text, Heading, Flex } from '@radix-ui/themes';
import InteractiveSmokeBackground from '@/components/background/InteractiveSmokeBackground';
import { useSession } from "next-auth/react";
import LargeTextDisplay from '@/components/webgl/LargeTextDisplay';
import RssTicker from '@/components/rss-feeds/RssTicker';
import { useState, useEffect } from 'react';

const HomePage = () => {
  console.log('HomePage: Rendering started');
  const { theme } = useThemeContext();
  const { data: session, status } = useSession();
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(null);

  const showAdminLink = session?.user?.roles?.some(role =>
    ['admin', 'moderator', 'editor', 'content_creator'].includes(role)
  );

  useEffect(() => {
    const updateDimensions = () => {
      console.log('HomePage: Updating dimensions', window.innerWidth, window.innerHeight);
      setDimensions({
        width: window.innerWidth,
        height: Math.max(200, window.innerHeight * 0.4),
      });
    };
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  console.log('HomePage: Current theme', theme);
  console.log('HomePage: Current session status', status);
  console.log('HomePage: Session data', session);

  return (
    <Box
      style={{
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        fontFamily: theme.font,
      }}
      className="relative w-full min-h-screen"
    >
      <InteractiveSmokeBackground
        smokeSpeed={theme.smokeSpeed ?? 0.001}
        smokeOpacity={theme.smokeOpacity ?? 0.3}
      />
      {/* Move the RssTicker to the top */}
      <Box className="absolute top-0 left-0 right-0 z-40" style={{ height: '32px' }}>
        <RssTicker />
      </Box>
      
      {dimensions && (
        <Box
          className="absolute top-0 left-0 w-full z-30"
          style={{ height: `${dimensions.height}px` }}
        >
          <LargeTextDisplay dimensions={dimensions} />
        </Box>
      )}
      <Box
        className="relative z-20 max-w-7xl mx-auto py-16 px-4 sm:py-24 sm:px-6 lg:px-8"
        style={{ paddingTop: `${(dimensions?.height ?? 0) + 20}px` }}
      >
        <Box className="text-center">
          <Heading
            size={{ initial: '8', sm: '9' }}
            weight="bold"
            style={{ color: 'var(--color-text)' }}
          >
            Once Human <br />
            <Text style={{ color: `var(--${theme.accentColor}-9)` }}>
              Synapse Warband
            </Text>
          </Heading>
          <Text
            size={{ initial: '4', sm: '5' }}
            className="mt-3 max-w-md mx-auto md:mt-5 md:max-w-3xl"
            style={{ color: 'var(--color-text)' }}
          >
            The official website for the Once Human warband, Synapse!
          </Text>
          <Flex className="mt-5 justify-center space-x-4 md:mt-8">
            <Button
              size="3"
              style={{
                borderRadius: `var(--radius-${theme.radius})`,
                backgroundColor: `var(--${theme.accentColor}-9)`,
                color: 'var(--accent-contrast)',
              }}
            >
              <Link href="/recipes">View Recipes</Link>
            </Button>
            {showAdminLink && (
              <Button
                size="3"
                variant="soft"
                style={{
                  borderRadius: `var(--radius-${theme.radius})`,
                  backgroundColor: 'var(--color-panel)',
                  color: 'var(--color-text)',
                }}
              >
                <Link href="/admin">Admin Panel</Link>
              </Button>
            )}
          </Flex>
        </Box>
      </Box>
    </Box>
  );
};

export default HomePage;
