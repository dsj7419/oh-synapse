import React, { useMemo } from 'react';
import type { User } from '@prisma/client';
import { Box, Flex, Text, Card, ScrollArea, Checkbox } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface UserWithRoles extends User {
  roles: string[];
}

interface UserListProps {
  users: UserWithRoles[];
  searchTerm: string;
  selectedUser: UserWithRoles | null;
  onUserSelect: (user: UserWithRoles) => void;
  showAdminOnly: boolean;
  onToggleAdminOnly: (checked: boolean) => void;
}

const UserList: React.FC<UserListProps> = ({ users, searchTerm, selectedUser, onUserSelect, showAdminOnly, onToggleAdminOnly }) => {
  const { theme } = useThemeContext();

  const sortedAndFilteredUsers = useMemo(() => {
    return users
      .filter(user => 
        (user.name ?? '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.email ?? '').toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(user => !showAdminOnly || user.roles.some(role => ['admin', 'moderator', 'editor', 'content_creator'].includes(role)))
      .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
  }, [users, searchTerm, showAdminOnly]);

  const capitalizeFirstLetter = (string: string) => {
    return string.charAt(0).toUpperCase() + string.slice(1);
  };

  return (
    <Box>
      <Flex align="center" mb="2">
        <Checkbox 
          checked={showAdminOnly} 
          onCheckedChange={onToggleAdminOnly}
          mr="2"
        />
        <Text size="2">Show admin roles only</Text>
      </Flex>
      <ScrollArea style={{ height: 400 }}>
        <Flex direction="column" gap="2">
          {sortedAndFilteredUsers.map(user => (
            <Card
              key={user.id}
              onClick={() => onUserSelect(user)}
              style={{
                cursor: 'pointer',
                backgroundColor: selectedUser?.id === user.id ? `var(--${theme.accentColor}-3)` : undefined,
                transition: 'background-color 0.2s ease-in-out',
              }}
            >
              <Flex justify="between" align="center">
                <Text 
                  weight="bold" 
                  style={{
                    transition: 'color 0.2s ease-in-out',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.color = `var(--${theme.accentColor}-9)`}
                  onMouseLeave={(e) => e.currentTarget.style.color = ''}
                >
                  {capitalizeFirstLetter(user.name ?? 'Unnamed User')} - {user.email}
                </Text>
                {user.banned && (
                  <Text size="1" style={{
                    backgroundColor: 'var(--red-9)',
                    color: 'var(--color-background)',
                    padding: '2px 6px',
                    borderRadius: `var(--radius-${theme.radius})`,
                  }}>
                    Banned
                  </Text>
                )}
              </Flex>
            </Card>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  );
};

export default UserList;