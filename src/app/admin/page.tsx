'use client';

import React from 'react';
import DashboardGrid from '@/components/admin/dashboard/DashboardGrid.component';
import { useThemeContext } from '@/context/ThemeContext';
import { Box } from '@radix-ui/themes';

const AdminPage: React.FC = () => {
  const { theme } = useThemeContext();

  return (
    <Box
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--color-background)',
        color: 'var(--color-text)',
        fontFamily: theme.font,
      }}
    >
      <DashboardGrid />
    </Box>
  );
};

export default AdminPage;