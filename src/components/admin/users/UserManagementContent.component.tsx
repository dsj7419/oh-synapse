'use client';

import React, { useEffect } from 'react';
import { api } from "@/trpc/react";
import UserManagement from './UserManagement.component';
import { Box, Text, Card } from '@radix-ui/themes';
import type { User, Role } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/navigation';

interface UserWithRoles extends User {
  roles: string[];
}

const UserManagementContent: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();

  const { data: users, error: usersError } = api.user.getAll.useQuery(undefined, {
    enabled: status === 'authenticated',
  });

  const { data: roles, error: rolesError } = api.role.getAll.useQuery(undefined, {
    enabled: status === 'authenticated',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin');
    } else if (session?.user && !session.user.roles?.some(role => ['admin', 'moderator', 'editor', 'content_creator'].includes(role))) {
      router.push('/');
    }
  }, [status, session, router]);

  if (status === 'loading') {
    return <Text>Loading...</Text>;
  }

  if (usersError || rolesError) {
    const errorMessage = usersError?.message || rolesError?.message || "An unknown error occurred";
    return (
      <Card>
        <Box style={{ backgroundColor: 'var(--red-3)', borderColor: 'var(--red-6)', color: 'var(--red-11)', padding: '16px', borderRadius: 'var(--radius-2)' }}>
          <Text weight="bold">Error:</Text>
          <Text>{errorMessage}</Text>
        </Box>
      </Card>
    );
  }

  if (!users || !roles || !session?.user) {
    return <Text>Loading...</Text>;
  }

  return (
    <UserManagement
      initialUsers={users as UserWithRoles[]}
      roles={roles}
      currentUser={session.user as UserWithRoles}
    />
  );
};

export default UserManagementContent;