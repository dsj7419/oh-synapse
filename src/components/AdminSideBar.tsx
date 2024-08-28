'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const AdminSidebar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { href: '/admin', label: 'Dashboard' },
    { href: '/admin/recipes', label: 'Recipes' },
    { href: '/admin/bonus-stats', label: 'Bonus Stats' },
    { href: '/admin/locations', label: 'Locations' },
    { href: '/admin/users', label: 'User Management' },
  ];

  return (
    <aside className="bg-indigo-700 text-white w-64 min-h-screen p-4">
      <h2 className="text-xl font-bold mb-6">Admin Panel</h2>
      <nav>
        <ul>
          {navItems.map((item) => (
            <li key={item.href} className="mb-2">
              <Link
                href={item.href}
                className={`block p-2 rounded hover:bg-indigo-600 ${
                  pathname === item.href ? 'bg-indigo-800' : ''
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default AdminSidebar;