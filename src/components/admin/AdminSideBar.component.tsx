'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuthorizedNavItems } from '@/hooks/useAuthorizedNavItems';
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Flex, Text, Button } from '@radix-ui/themes';
import { ChevronRight, ChevronLeft } from 'lucide-react';

const AdminSideBar: React.FC = () => {
  const pathname = usePathname();
  const navItems = useAuthorizedNavItems();
  const { theme } = useThemeContext();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <Box
      className="hidden md:block relative"
      style={{
        width: isCollapsed ? '60px' : '180px',
        minHeight: 'calc(100vh - 75px)',
        backgroundColor: 'var(--color-panel)',
        borderRight: '1px solid var(--color-border)',
        marginTop: '0px',
        paddingTop: '10px',
        transition: 'width 0.3s ease-in-out',
      }}
    >
      <Button
        className="absolute top-2 right-2"
        variant="ghost"
        onClick={toggleSidebar}
      >
        {isCollapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
      </Button>
      <Flex direction="column" p="4">
        {!isCollapsed && (
          <Text size="6" weight="bold" mb="6" style={{ color: 'var(--color-text)' }}>
            Admin Panel
          </Text>
        )}
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
                  textAlign: isCollapsed ? 'center' : 'left',
                }}
                title={item.label}
              >
                {isCollapsed ? item.label.charAt(0) : item.label}
              </Link>
            ))}
          </Flex>
        </nav>
      </Flex>
    </Box>
  );
};

export default AdminSideBar;