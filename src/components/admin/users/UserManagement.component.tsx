'use client';

import React, { useState, useEffect } from 'react';
import type { User, Role } from '@prisma/client';
import { api } from "@/trpc/react";
import UserList from './UserList.component';
import UserDetails from './UserDetails.component';
import { useSession } from "next-auth/react";
import { useRoleManagement } from '@/hooks/useRoleManagement';
import { useRouter } from 'next/navigation';
import { Box, Flex, Text, Heading, TextField, Card } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface UserWithRoles extends User {
  roles: string[];
}

interface UserManagementProps {
  initialUsers: UserWithRoles[];
  roles: Role[];
  currentUser: UserWithRoles;
}

const UserManagement: React.FC<UserManagementProps> = ({ initialUsers, roles: initialRoles, currentUser }) => {
  const [users, setUsers] = useState<UserWithRoles[]>(initialUsers);
  const [roles, setRoles] = useState<Role[]>(initialRoles);
  const [showAdminOnly, setShowAdminOnly] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const logActionMutation = api.auditLogs.logAction.useMutation();

  const { data: session } = useSession();
  const router = useRouter();
  const { canAccessUserManagement } = useRoleManagement(currentUser);
  const { theme } = useThemeContext();

  const { data: fetchedUsers, error: fetchUserError } = api.user.getAll.useQuery(undefined, {
    initialData: initialUsers,
    enabled: !!session?.user,
  });

  const { data: fetchedRoles, error: fetchRoleError } = api.role.getAll.useQuery(undefined, {
    initialData: initialRoles,
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (fetchedUsers) {
      setUsers(fetchedUsers as UserWithRoles[]);
    }
    if (fetchUserError) {
      const errorMessage = fetchUserError instanceof Error ? fetchUserError.message : 'An unknown error occurred';
      setErrorMessage(`Error fetching users: ${errorMessage}`);
    }
  }, [fetchedUsers, fetchUserError]);

  useEffect(() => {
    if (fetchedRoles) {
      setRoles(fetchedRoles);
    }
    if (fetchRoleError) {
      const errorMessage = fetchRoleError instanceof Error ? fetchRoleError.message : 'An unknown error occurred';
      setErrorMessage(`Error fetching roles: ${errorMessage}`);
    }
  }, [fetchedRoles, fetchRoleError]);

  useEffect(() => {
    if (session?.user && !canAccessUserManagement(session.user as UserWithRoles)) {
      router.push('/');
    }
  }, [session, canAccessUserManagement, router]);

  if (!session?.user) {
    return <Text>Access Denied. Please log in.</Text>;
  }

  const updateUserMutation = api.user.updateRoles.useMutation({
    onSuccess: async (updatedUser) => {
      setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
      setErrorMessage(null);

      try {
        await logActionMutation.mutateAsync({
          action: 'Update User Role',
          resourceType: 'User Role',
          resourceId: updatedUser.id,
          severity: 'high',
          details: { updatedUserId: updatedUser.id, roles: updatedUser.roles.join(', ') },
        });
      } catch (error) {
        console.error('Failed to log User Role update:', error);
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(`Failed to update user role: ${errorMessage}`);
    },
  });

  const banUserMutation = api.user.banUser.useMutation({
    onSuccess: async (updatedUser) => {
      setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
      setErrorMessage(null);
      try {
        await logActionMutation.mutateAsync({
          action: 'Ban User',
          resourceType: 'User',
          resourceId: updatedUser.id,
          severity: 'severe',
          details: { bannedUserId: updatedUser.id },
        });
      } catch (logError) {
        console.error('Failed to log user ban action:', logError);
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(`Failed to ban user: ${errorMessage}`);
      logActionMutation.mutate({
        action: 'Ban User Failed',
        resourceType: 'User',
        severity: 'high',
        details: { error: errorMessage },
      });
    },
  });
  
  const unbanUserMutation = api.user.unbanUser.useMutation({
    onSuccess: async (updatedUser) => {
      setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
      setErrorMessage(null);
      try {
        await logActionMutation.mutateAsync({
          action: 'Unban User',
          resourceType: 'User',
          resourceId: updatedUser.id,
          severity: 'high',
          details: { unbannedUserId: updatedUser.id },
        });
      } catch (logError) {
        console.error('Failed to log user unban action:', logError);
      }
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(`Failed to unban user: ${errorMessage}`);
      logActionMutation.mutate({
        action: 'Unban User Failed',
        resourceType: 'User',
        severity: 'high',
        details: { error: errorMessage },
      });
    },
  });

  const handleRoleChange = (userId: string, roleId: string, checked: boolean) => {
    updateUserMutation.mutate({ userId, roleId, assign: checked });
  };

  const handleBanUser = (userId: string) => {
    banUserMutation.mutate({ userId });
  };

  const handleUnbanUser = (userId: string) => {
    unbanUserMutation.mutate({ userId });
  };

  return (
    <Flex gap="4">
      {errorMessage && (
        <Card style={{
          backgroundColor: 'var(--red-3)',
          borderColor: 'var(--red-6)',
          color: 'var(--red-11)',
        }}>
          <Text weight="bold">Error:</Text>
          <Text>{errorMessage}</Text>
        </Card>
      )}
      <Card style={{ flex: 1 }}>
        <Heading size="3" mb="4">User List</Heading>
        <TextField.Root
          mb="4"
          size="3"
          variant="surface"
          radius={theme.radius}
          style={{ flex: 1 }}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
          placeholder="Search users..."
        />
        <UserList
          users={users}
          searchTerm={searchTerm}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
          showAdminOnly={showAdminOnly}
          onToggleAdminOnly={(checked) => setShowAdminOnly(checked)}
        />
      </Card>
      <Box style={{ flex: 2 }}>
        {selectedUser ? (
          <UserDetails
            user={selectedUser}
            roles={roles}
            currentUser={currentUser}
            onRoleChange={handleRoleChange}
            onBanUser={handleBanUser}
            onUnbanUser={handleUnbanUser}
          />
        ) : (
          <Card>
            <Text>Select a user to view details and manage roles.</Text>
          </Card>
        )}
      </Box>
    </Flex>
  );
};

export default UserManagement;