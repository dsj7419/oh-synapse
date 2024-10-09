'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthorizedNavItems } from '@/hooks/useAuthorizedNavItems';
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Flex, Text, Button, DropdownMenu } from '@radix-ui/themes';
import { Menu } from 'lucide-react';

const AdminMobileNav: React.FC = () => {
  const pathname = usePathname();
  const navItems = useAuthorizedNavItems();
  const { theme } = useThemeContext();

  return (
    <Box className="md:hidden fixed bottom-4 right-4 z-50">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button size="3" variant="solid">
            <Menu />
            <Text ml="2">Admin Menu</Text>
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {navItems.map((item) => (
            <DropdownMenu.Item key={item.href}>
              <Link
                href={item.href}
                style={{
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  fontSize: theme.typographyScale,
                  display: 'block',
                  width: '100%',
                }}
              >
                {item.label}
              </Link>
            </DropdownMenu.Item>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Box>
  );
};

export default AdminMobileNav;