// components/user/UserMenu.component.tsx

'use client';

import { useState, useRef, useEffect } from 'react';
import { signOut } from "next-auth/react";
import Link from 'next/link';
import Image from 'next/image';
import { useThemeContext } from '@/context/ThemeContext';
import { Box, DropdownMenu, Button, Avatar } from '@radix-ui/themes';

interface UserMenuProps {
  user: {
    name?: string | null;
    image?: string | null;
  };
}

export function UserMenu({ user }: UserMenuProps) {
  const { theme } = useThemeContext();
  const displayName = user.name ? user.name.charAt(0).toUpperCase() + user.name.slice(1) : 'User';

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button variant="ghost" radius={theme.radius}>
          <Avatar
            src={user.image ?? undefined}
            fallback={displayName.charAt(0)}
            size="2"
            radius={theme.radius}
            className="mr-2"
          />
          {displayName}
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>
          <Link href="/profile">Profile</Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item color="red" onClick={() => signOut()}>
          Sign Out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}