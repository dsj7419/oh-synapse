import { User, Role } from '@prisma/client';

interface UserWithRoles extends User {
  roles: string[];
}

export function useRoleManagement(currentUser: UserWithRoles) {
  const canManageRole = (role: Role, targetUser: UserWithRoles) => {
    if (role.name === 'viewer') return false; // Viewer role can't be managed
    if (currentUser.id === targetUser.id) return false; // Users can't manage their own roles
    if (currentUser.roles.includes('admin')) return true; // Admins can manage all roles except viewer
    if (role.name === 'admin') return false; // Only admins can manage admin role
    return currentUser.roles.includes(role.name); // Users can only manage roles they have
  };

  const canBanUser = (targetUser: UserWithRoles) => {
    if (currentUser.id === targetUser.id) return false; // Users can't ban themselves
    return currentUser.roles.includes('admin') || currentUser.roles.includes('moderator');
  };

  const userHasRole = (user: UserWithRoles, roleName: string) => {
    return user.roles.includes(roleName);
  };

  const canAccessUserManagement = (user: UserWithRoles) => {
    const managementRoles = ['admin', 'moderator', 'editor', 'content_creator'];
    return user.roles.some(role => managementRoles.includes(role));
  };

  return { canManageRole, canBanUser, userHasRole, canAccessUserManagement };
}