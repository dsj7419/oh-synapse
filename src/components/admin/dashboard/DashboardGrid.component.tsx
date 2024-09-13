"use client";

import React from 'react';
import DashboardCard from '@/components/admin/dashboard/DashboardCard.component';
import { useAutoAnimate } from '@formkit/auto-animate/react';

const DashboardGrid: React.FC = () => {
  const [parent] = useAutoAnimate();

  const cards = [
    { title: "Audit Logs", href: "/admin/audit-logs", description: "View and manage audit logs" },
    { title: "User Management", href: "/admin/users", description: "Manage users and their roles" },
    { title: "Recipes", href: "/admin/recipes", description: "Manage in-game recipes" },
    { title: "Bonus Stats", href: "/admin/bonus-stats", description: "Manage bonus stats for recipes" },
    { title: "Recipe Locations", href: "/admin/locations", description: "Manage recipe locations" },
  ];

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <div ref={parent} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card) => (
          <DashboardCard key={card.title} title={card.title} href={card.href} description={card.description} />
        ))}
      </div>
    </div>
  );
};

export default DashboardGrid;
