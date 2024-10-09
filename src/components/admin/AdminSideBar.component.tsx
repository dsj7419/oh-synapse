// components/admin/AdminSideBar.component.tsx

'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthorizedNavItems } from '@/hooks/useAuthorizedNavItems';
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Flex, Text } from '@radix-ui/themes';

const AdminSideBar: React.FC = () => {
  const pathname = usePathname();
  const navItems = useAuthorizedNavItems();
  const { theme } = useThemeContext();

  return (
    <Box
      style={{
        width: '180px',
        minHeight: 'calc(100vh - 75px)',
        backgroundColor: 'var(--color-panel)',
        borderRight: '1px solid var(--color-border)',
        marginTop: '0px',
        paddingTop: '10px',
      }}
    >
      <Flex direction="column" p="4">
        <Text size="6" weight="bold" mb="6" style={{ color: 'var(--color-text)' }}>
          Admin Panel
        </Text>
        <nav>
          <Flex direction="column" gap="2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  block p-2
                  transition-all duration-200 ease-in-out
                  hover:bg-[var(--accent-a5)] hover:translate-y-[-2px]
                  ${pathname === item.href ? 'bg-[var(--accent-a7)]' : ''}
                `}
                style={{
                  color: 'var(--color-text)',
                  textDecoration: 'none',
                  borderRadius: `var(--radius-${theme.radius})`,
                  fontSize: theme.typographyScale,
                }}
              >
                {item.label}
              </Link>
            ))}
          </Flex>
        </nav>
      </Flex>
    </Box>
  );
};

export default AdminSideBar;