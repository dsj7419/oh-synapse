import { useSession } from "next-auth/react";

interface NavItem {
  href: string;
  label: string;
  allowedRoles: string[];
}

export function useAuthorizedNavItems() {
  const { data: session } = useSession();

  const allNavItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', allowedRoles: ['admin', 'moderator', 'editor', 'content_creator'] },
    { href: '/admin/recipes', label: 'Recipes', allowedRoles: ['admin', 'editor'] },
    { href: '/admin/bonus-stats', label: 'Bonus Stats', allowedRoles: ['admin', 'editor'] },
    { href: '/admin/locations', label: 'Locations', allowedRoles: ['admin', 'editor'] }, 
    { href: '/admin/users', label: 'User Management', allowedRoles: ['admin', 'moderator', 'editor', 'content_creator'] },
    { href: '/admin/audit-logs', label: 'Audit Logs', allowedRoles: ['admin'] },
    { href: '/admin/playground', label: 'Playground', allowedRoles: ['admin', 'content_creator'] },
  ];

  const authorizedNavItems = allNavItems.filter(item => 
    session?.user?.roles.some(role => item.allowedRoles.includes(role))
  );

  return authorizedNavItems;
}
