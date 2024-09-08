'use client';

import React, { useState, useEffect } from 'react';
import type { User, Role } from '@prisma/client';
import { api } from "@/trpc/react";
import UserList from './UserList.component';
import UserDetails from './UserDetails.component';
import { useSession } from "next-auth/react";
import { useRoleManagement } from '@/hooks/useRoleManagement';
import { useRouter } from 'next/navigation';
import { logAction } from "@/utils/auditLogger"; 

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
  const [selectedUser, setSelectedUser] = useState<UserWithRoles | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: session } = useSession();
  const router = useRouter();
  const { canAccessUserManagement } = useRoleManagement(currentUser);


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
    return <div>Access Denied. Please log in.</div>;
  }

  const updateUserMutation = api.user.updateRoles.useMutation({
    onSuccess: async (updatedUser) => {
      setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
      setErrorMessage(null);


      await logAction({
        userId: currentUser.id,
        username: currentUser.name ?? 'Unknown',
        userRole: currentUser.roles.join(', '),
        action: 'Update User Role',
        resourceType: 'User Role',
        resourceId: updatedUser.id,
        severity: 'high',
        details: { updatedUserId: updatedUser.id, roles: updatedUser.roles.join(', ') },
      });
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


      await logAction({
        userId: currentUser.id,
        username: currentUser.name ?? 'Unknown',
        userRole: currentUser.roles.join(', '),
        action: 'Ban User',
        resourceType: 'User',
        resourceId: updatedUser.id,
        severity: 'severe',
        details: { bannedUserId: updatedUser.id },
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(`Failed to ban user: ${errorMessage}`);
    },
  });

  const unbanUserMutation = api.user.unbanUser.useMutation({
    onSuccess: async (updatedUser) => {
      setUsers(prevUsers => prevUsers.map(user => user.id === updatedUser.id ? updatedUser : user));
      if (selectedUser && selectedUser.id === updatedUser.id) {
        setSelectedUser(updatedUser);
      }
      setErrorMessage(null);


      await logAction({
        userId: currentUser.id,
        username: currentUser.name ?? 'Unknown',
        userRole: currentUser.roles.join(', '),
        action: 'Unban User',
        resourceType: 'User',
        resourceId: updatedUser.id,
        severity: 'high',
        details: { unbannedUserId: updatedUser.id },
      });
    },
    onError: (error) => {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setErrorMessage(`Failed to unban user: ${errorMessage}`);
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
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {errorMessage && (
        <div className="col-span-full bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {errorMessage}</span>
        </div>
      )}
      <div className="md:col-span-1 bg-white p-4 rounded shadow">
        <h2 className="text-xl font-semibold mb-4">User List</h2>
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <UserList
          users={users}
          searchTerm={searchTerm}
          selectedUser={selectedUser}
          onUserSelect={setSelectedUser}
        />
      </div>
      <div className="md:col-span-2 bg-white p-4 rounded shadow">
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
          <p>Select a user to view details and manage roles.</p>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
