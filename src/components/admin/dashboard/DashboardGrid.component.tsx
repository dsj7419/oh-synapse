"use client";

import React from 'react';
import DashboardCard from '@/components/admin/dashboard/DashboardCard.component';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import { useThemeContext } from '@/context/ThemeContext';
import { Box, Heading } from '@radix-ui/themes';

const DashboardGrid: React.FC = () => {
  const [parent] = useAutoAnimate();
  const { theme } = useThemeContext();

  const cards = [
    { title: "Bonus Stats", href: "/admin/bonus-stats", description: "Manage bonus stats for recipes" },
    { title: "Recipes", href: "/admin/recipes", description: "Manage in-game recipes" },
    { title: "Recipe Locations", href: "/admin/locations", description: "Manage recipe locations" },
    { title: "Playground", href: "/admin/playground", description: "THE Creative Playground!" },
    { title: "Rss Feeds", href: "/admin/rss-settings", description: "Anything and Everything RSS"},
    { title: "User Management", href: "/admin/users", description: "Manage users and their roles" },
    { title: "Audit Logs", href: "/admin/audit-logs", description: "View and manage audit logs" },
  ];

  return (
    <Box style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px' }}>
      <Heading size="8" mb="6" style={{ color: 'var(--color-text)', textAlign: 'center' }}>Admin Dashboard</Heading>
      <Box
        ref={parent}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '24px',
          padding: '44px',
          background: 'linear-gradient(45deg, var(--accent-a2), var(--accent-a5))',
          borderRadius: `var(--radius-${theme.radius})`,
          boxShadow: 'var(--shadow-4)',
        }}
      >
        {cards.map((card) => (
          <DashboardCard key={card.title} title={card.title} href={card.href} description={card.description} />
        ))}
      </Box>
    </Box>
  );
};

export default DashboardGrid;