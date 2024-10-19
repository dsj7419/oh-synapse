'use client';

import Link from 'next/link';
import { useSession } from "next-auth/react";
import { UserMenu } from '../user/UserMenu.component';
import { useThemeContext } from '@/context/ThemeContext';
import { Flex, Button, Box, Text } from '@radix-ui/themes';
import NavbarLogo from '../webgl/NavbarLogo';
import { useState } from 'react';
import { Menu } from 'lucide-react';

export function Navigation() {
  const { data: session } = useSession();
  const { theme } = useThemeContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const showAdminLink = session?.user.roles?.some(role =>
    ['admin', 'moderator', 'editor', 'content_creator'].includes(role)
  );

  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/recipes', label: 'Recipes' },
    { href: '/rss', label: 'Feed' },
    { href: '/memetics/tables', label: 'Memetics'},
    ...(showAdminLink ? [{ href: '/admin', label: 'Admin' }] : []),
  ];

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
          <Box className="md:hidden">
            <Button
              variant="ghost"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu size={24} />
            </Button>
          </Box>
          <Flex gap="8" className="hidden md:flex" style={{ marginLeft: '16px' }}>
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button variant="ghost" radius={theme.radius} size="2" asChild>
                  <Text>{item.label}</Text>
                </Button>
              </Link>
            ))}
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
      {isMenuOpen && (
        <Box
          className="md:hidden"
          style={{
            position: 'absolute',
            top: '64px',
            left: 0,
            right: 0,
            backgroundColor: 'var(--color-background)',
            borderTop: '1px solid var(--color-border)',
          }}
        >
          <Flex direction="column" p="4">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} passHref>
                <Button
                  variant="ghost"
                  radius={theme.radius}
                  size="2"
                  style={{ width: '100%', justifyContent: 'flex-start', marginBottom: '8px' }}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Text>{item.label}</Text>
                </Button>
              </Link>
            ))}
          </Flex>
        </Box>
      )}
    </Box>
  );
}