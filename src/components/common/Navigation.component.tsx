'use client';
import Link from 'next/link';
import { useSession } from "next-auth/react";
import { UserMenu } from '../user/UserMenu.component';
import { useThemeContext } from '@/context/ThemeContext';
import { Flex, Button, Box, Text } from '@radix-ui/themes';
import NavbarLogo from '../webgl/NavbarLogo';

export function Navigation() {
  const { data: session } = useSession();
  const { theme } = useThemeContext();
  const showAdminLink = session?.user.roles?.some(role =>
    ['admin', 'moderator', 'editor', 'content_creator'].includes(role)
  );

  return (
    <Box
      position="fixed"
      top="0"
      left="0"
      right="0"
      style={{
        zIndex: 50,
        backgroundColor: 'var(--color-background)',
        borderBottom: '1px solid var(--color-border)',
        height: '64px',
      }}
    >
      <Flex
        justify="between"
        align="center"
        style={{
          height: '100%',
          width: '100%',
          padding: '0 16px',
        }}
      >
        <Flex align="center" gap="4" style={{ flex: 1 }}>
          <Box style={{ width: '180px', height: '64px' }}>
            <NavbarLogo />
          </Box>
         
          <Flex gap="8" style={{ marginLeft: '16px' }}>
            <Link href="/" passHref>
              <Button variant="ghost" radius={theme.radius} size="2" asChild>
                <Text>Home</Text>
              </Button>
            </Link>
            <Link href="/recipes" passHref>
              <Button variant="ghost" radius={theme.radius} size="2" asChild>
                <Text>Recipes</Text>
              </Button>
            </Link>
            <Link href="/rss" passHref>
              <Button variant="ghost" radius={theme.radius} size="2" asChild>
                <Text>Feed</Text>
              </Button>
            </Link>
            {showAdminLink && (
              <Link href="/admin" passHref>
                <Button variant="ghost" radius={theme.radius} size="2" asChild>
                  <Text>Admin</Text>
                </Button>
              </Link>
            )}
          </Flex>
        </Flex>
        <Box>
          {session ? (
            <UserMenu user={session.user} />
          ) : (
            <Link href="/api/auth/signin" passHref>
              <Button variant="solid" radius={theme.radius} size="2">Sign In</Button>
            </Link>
          )}
        </Box>
      </Flex>
    </Box>
  );
}