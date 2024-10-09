'use client';
import React, { useState } from 'react';
import type { Role, User } from '@prisma/client';
import { useRoleManagement } from '@/hooks/useRoleManagement';
import ConfirmationModal from '@/components/common/ConfirmationModal.component';
import { Box, Flex, Text, Heading, Checkbox, Button, Card, Avatar } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface UserWithRoles extends User {
  roles: string[];
}

interface UserDetailsProps {
  user: UserWithRoles;
  roles: Role[];
  currentUser: UserWithRoles;
  onRoleChange: (userId: string, roleId: string, checked: boolean) => void;
  onBanUser: (userId: string) => void;
  onUnbanUser: (userId: string) => void;
}

const UserDetails: React.FC<UserDetailsProps> = ({ user, roles, currentUser, onRoleChange, onBanUser, onUnbanUser }) => {
  const { isRoleDisabled, canBanUser, userHasRole } = useRoleManagement(currentUser);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const { theme } = useThemeContext();

  const handleBanUnbanClick = () => {
    setIsConfirmationOpen(true);
  };

  const handleConfirm = () => {
    if (user.banned) {
      onUnbanUser(user.id);
    } else {
      onBanUser(user.id);
    }
    setIsConfirmationOpen(false);
  };

  const capitalizedName = user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'Unnamed User';

  return (
    <Card size="3">
      <Flex align="center" gap="4" mb="4">
        <Avatar
          size="8"
          src={user.image || undefined}
          fallback={(user.name?.charAt(0) || 'U').toUpperCase()}
          radius="full"
          variant="soft"
          color={theme.accentColor}
        />
        <Box>
          <Heading size="4">{capitalizedName}</Heading>
          <Text as="p" size="2" color="gray">{user.email}</Text>
        </Box>
      </Flex>
     
      {user.banned && (
        <Box mb="4" p="2" style={{ backgroundColor: 'var(--red-3)', borderRadius: 'var(--radius-2)' }}>
          <Text color="red" weight="bold">BANNED</Text>
        </Box>
      )}
      <Heading size="3" mb="2">Roles</Heading>
      <Flex direction="column" gap="2" mb="4">
        {roles.map((role) => {
          const isChecked = userHasRole(user, role.name);
          const isDisabled = isRoleDisabled(role, user);
          return (
            <Flex key={role.id} align="center">
              <Checkbox
                id={`role-${role.id}`}
                checked={isChecked}
                onCheckedChange={(checked) => onRoleChange(user.id, role.id, checked === true)}
                disabled={isDisabled}
              />
              <Text as="label" htmlFor={`role-${role.id}`} ml="2" color={isDisabled ? 'gray' : undefined}>
                {role.name}
              </Text>
            </Flex>
          );
        })}
      </Flex>
      {canBanUser(user) && (
        <Button
          onClick={handleBanUnbanClick}
          color={user.banned ? theme.accentColor : 'red'}
          variant={user.banned ? 'soft' : 'solid'}
        >
          {user.banned ? 'Unban User' : 'Ban User'}
        </Button>
      )}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        onConfirm={handleConfirm}
        title={user.banned ? 'Unban User' : 'Ban User'}
        message={`Are you sure you want to ${user.banned ? 'unban' : 'ban'} this user?`}
        confirmText={user.banned ? 'Unban' : 'Ban'}
        confirmColor={user.banned ? 'green' : 'red'}
      />
    </Card>
  );
};

export default UserDetails;