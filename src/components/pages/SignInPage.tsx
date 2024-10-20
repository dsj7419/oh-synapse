'use client';

import { signIn } from 'next-auth/react';
import { useThemeContext } from '@/context/ThemeContext';
import AbstractBackground from '@/components/background/AbstractBackground';
import { Box, Flex, Card, Heading, Text, Button } from '@radix-ui/themes';
import { MessageCircle } from 'lucide-react';
import NavbarLogo from '@/components/webgl/NavbarLogo';

const SignInPage: React.FC = () => {
  const { theme } = useThemeContext();

  const handleSignIn = () => {
    void signIn('discord', { callbackUrl: '/' });
  };

  return (
    <Box className="relative flex min-h-screen items-center justify-center">
      <AbstractBackground />
      <Card
        size="3"
        style={{
          backgroundColor: 'var(--color-panel)',
          borderColor: `var(--${theme.accentColor}-6)`,
          maxWidth: '400px',
          width: '90%',
        }}
      >
        <Flex direction="column" align="center" gap="4">
          <Box style={{ width: '180px', height: '64px' }}>
            <NavbarLogo />
          </Box>
          <Heading size="6" style={{ color: 'var(--color-text)' }}>
            Welcome to OH Fan Site!
          </Heading>
          <Text
            size="2"
            style={{
              color: 'var(--color-text-secondary)',
              textAlign: 'center',
            }}
          >
            Join to track exclusive recipes progress, RSS feeds, and more to
            come!
          </Text>
          <Button
            size="3"
            onClick={handleSignIn}
            style={{
              backgroundColor: `var(--${theme.accentColor}-9)`,
              color: 'var(--color-text-contrast)',
              width: '100%',
            }}
          >
            <MessageCircle className="mr-2" />
            Sign in with Discord
          </Button>
        </Flex>
      </Card>
    </Box>
  );
};

export default SignInPage;
