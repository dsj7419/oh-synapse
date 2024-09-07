import type { User, Role } from '@prisma/client';

interface UserWithRoles extends User {
  roles: string[];
}

export function useRoleManagement(currentUser: UserWithRoles) {
  // Function to check if the user is the elevated user
  const isElevatedUser = currentUser.email?.trim().toLowerCase() === process.env.NEXT_PUBLIC_DISCORD_ELEVATED_USER_ID?.trim().toLowerCase();

  // Function to determine if a user can manage a role
  const canManageRole = (role: Role, targetUser: UserWithRoles) => {
    // Elevated user can manage their own roles, but not 'viewer' or 'admin'
    if (isElevatedUser && currentUser.id === targetUser.id && role.name !== 'viewer' && role.name !== 'admin') {
      return true;
    }

    if (role.name === 'viewer') return false; // Viewer role can't be managed by anyone
    if (currentUser.id === targetUser.id) return false; // Users can't manage their own roles unless elevated
    if (currentUser.roles.includes('admin')) return true; // Admins can manage all roles except viewer
    if (role.name === 'admin') return false; // Only admins can manage admin role
    return currentUser.roles.includes(role.name); // Users can only manage roles they have
  };

  // Function to determine if the role checkbox should be disabled (grayed out)
  const isRoleDisabled = (role: Role, targetUser: UserWithRoles) => {
    // Viewer and Admin roles should always be disabled for the elevated user
    if (isElevatedUser && currentUser.id === targetUser.id && (role.name === 'viewer' || role.name === 'admin')) {
      return true; // Grayed out for elevated user managing themselves
    }

    // For others, check if they can manage the role
    return !canManageRole(role, targetUser); // If they can't manage it, disable the checkbox
  };

  // Function to determine if the user can ban the target user
  const canBanUser = (targetUser: UserWithRoles) => {
    if (currentUser.id === targetUser.id) return false; // Users can't ban themselves
    return currentUser.roles.includes('admin') || currentUser.roles.includes('moderator');
  };

  // Function to check if the user has a role
  const userHasRole = (user: UserWithRoles, roleName: string) => {
    return user.roles.includes(roleName);
  };

  // Function to check if the user can access user management
  const canAccessUserManagement = (user: UserWithRoles) => {
    const managementRoles = ['admin', 'moderator', 'editor', 'content_creator'];
    return user.roles.some(role => managementRoles.includes(role));
  };

  return { canManageRole, isRoleDisabled, canBanUser, userHasRole, canAccessUserManagement };
}
