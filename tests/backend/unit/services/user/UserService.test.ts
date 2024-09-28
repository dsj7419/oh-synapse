// tests/unit/services/user/UserService.test.ts

/**
 * @jest-environment node
 */

import { UserService } from '@/services/user/UserService';
import { db } from '@/server/db';
import { TRPCError } from '@trpc/server';
import type { PrismaClient } from '@prisma/client';

jest.mock('@/server/db', () => ({
  db: {
    user: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    role: {
      findUnique: jest.fn(),
    },
    userRole: {
      upsert: jest.fn(),
      deleteMany: jest.fn(),
    },
  },
}));

jest.mock('@/utils/auditLogger', () => ({
  logAction: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  let findManySpy: jest.SpyInstance;
  let findUniqueSpy: jest.SpyInstance;
  let updateSpy: jest.SpyInstance;
  let roleFindUniqueSpy: jest.SpyInstance;
  let userRoleUpsertSpy: jest.SpyInstance;
  let userRoleDeleteManySpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    userService = new UserService(db as unknown as PrismaClient);
    findManySpy = jest.spyOn(db.user, 'findMany');
    findUniqueSpy = jest.spyOn(db.user, 'findUnique');
    updateSpy = jest.spyOn(db.user, 'update');
    roleFindUniqueSpy = jest.spyOn(db.role, 'findUnique');
    userRoleUpsertSpy = jest.spyOn(db.userRole, 'upsert');
    userRoleDeleteManySpy = jest.spyOn(db.userRole, 'deleteMany');

    // Mock console.error to suppress error output during tests
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {
      /* no-op */
    });
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users with roles', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'User 1',
          roles: [{ role: { name: 'admin' } }, { role: { name: 'user' } }],
        },
        { id: '2', name: 'User 2', roles: [{ role: { name: 'user' } }] },
      ];

      findManySpy.mockResolvedValue(mockUsers);

      const result = await userService.getAllUsers();

      expect(result).toEqual([
        { id: '1', name: 'User 1', roles: ['admin', 'user'] },
        { id: '2', name: 'User 2', roles: ['user'] },
      ]);
      expect(findManySpy).toHaveBeenCalledWith({
        include: { roles: { include: { role: true } } },
      });
    });

    it('should throw an error if fetching users fails', async () => {
      findManySpy.mockRejectedValue(new Error('Database error'));

      await expect(userService.getAllUsers()).rejects.toThrow(TRPCError);

      expect(console.error).toHaveBeenCalledWith(
        'Error fetching users:',
        expect.any(Error)
      );
    });
  });

  describe('updateUserRoles', () => {
    const mockSessionUser = {
      id: 'admin1',
      name: 'Admin',
      email: 'admin@example.com',
      roles: ['admin'],
    };

    it('should update user roles successfully when assigning', async () => {
      roleFindUniqueSpy.mockResolvedValue({ id: 'role1', name: 'user' });
      userRoleUpsertSpy.mockResolvedValue({});
      findUniqueSpy.mockResolvedValue({
        id: 'user1',
        name: 'User',
        roles: [{ role: { name: 'user' } }],
      });

      const result = await userService.updateUserRoles(
        'user1',
        'role1',
        true,
        mockSessionUser
      );

      expect(result).toEqual({
        id: 'user1',
        name: 'User',
        roles: ['user'],
      });
      expect(userRoleUpsertSpy).toHaveBeenCalledWith({
        where: { userId_roleId: { userId: 'user1', roleId: 'role1' } },
        update: {},
        create: { userId: 'user1', roleId: 'role1', assignedBy: 'admin1' },
      });
    });

    it('should update user roles successfully when unassigning', async () => {
      roleFindUniqueSpy.mockResolvedValue({ id: 'role1', name: 'user' });
      userRoleDeleteManySpy.mockResolvedValue({ count: 1 });
      findUniqueSpy.mockResolvedValue({
        id: 'user1',
        name: 'User',
        roles: [],
      });

      const result = await userService.updateUserRoles(
        'user1',
        'role1',
        false,
        mockSessionUser
      );

      expect(result).toEqual({
        id: 'user1',
        name: 'User',
        roles: [],
      });
      expect(userRoleDeleteManySpy).toHaveBeenCalledWith({
        where: { userId: 'user1', roleId: 'role1' },
      });
    });

    it('should throw an error if role is not found', async () => {
      roleFindUniqueSpy.mockResolvedValue(null);

      await expect(
        userService.updateUserRoles('user1', 'role1', true, mockSessionUser)
      ).rejects.toThrow(TRPCError);

      expect(console.error).toHaveBeenCalledWith(
        'Failed to update user role:',
        expect.any(TRPCError)
      );
    });

    it('should throw an error if user is not found after updating roles', async () => {
      roleFindUniqueSpy.mockResolvedValue({ id: 'role1', name: 'user' });
      userRoleUpsertSpy.mockResolvedValue({});
      findUniqueSpy.mockResolvedValue(null);

      await expect(
        userService.updateUserRoles('user1', 'role1', true, mockSessionUser)
      ).rejects.toThrow(TRPCError);

      expect(console.error).toHaveBeenCalledWith(
        'Failed to update user role:',
        expect.any(TRPCError)
      );
    });
  });

  describe('banUser', () => {
    const mockSessionUser = {
      id: 'admin1',
      name: 'Admin',
      email: 'admin@example.com',
      roles: ['admin'],
    };

    it('should ban a user successfully', async () => {
      updateSpy.mockResolvedValue({
        id: 'user1',
        name: 'User',
        banned: true,
        roles: [{ role: { name: 'user' } }],
      });

      const result = await userService.banUser('user1', mockSessionUser);

      expect(result).toEqual({
        id: 'user1',
        name: 'User',
        banned: true,
        roles: ['user'],
      });
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { banned: true },
        include: { roles: { include: { role: true } } },
      });
    });

    it('should throw an error if banning fails', async () => {
      updateSpy.mockRejectedValue(new Error('Database error'));

      await expect(
        userService.banUser('user1', mockSessionUser)
      ).rejects.toThrow(TRPCError);

      expect(console.error).toHaveBeenCalledWith(
        'Failed to ban user:',
        expect.any(Error)
      );
    });
  });

  describe('unbanUser', () => {
    const mockSessionUser = {
      id: 'admin1',
      name: 'Admin',
      email: 'admin@example.com',
      roles: ['admin'],
    };

    it('should unban a user successfully', async () => {
      updateSpy.mockResolvedValue({
        id: 'user1',
        name: 'User',
        banned: false,
        roles: [{ role: { name: 'user' } }],
      });

      const result = await userService.unbanUser('user1', mockSessionUser);

      expect(result).toEqual({
        id: 'user1',
        name: 'User',
        banned: false,
        roles: ['user'],
      });
      expect(updateSpy).toHaveBeenCalledWith({
        where: { id: 'user1' },
        data: { banned: false },
        include: { roles: { include: { role: true } } },
      });
    });

    it('should throw an error if unbanning fails', async () => {
      updateSpy.mockRejectedValue(new Error('Database error'));

      await expect(
        userService.unbanUser('user1', mockSessionUser)
      ).rejects.toThrow(TRPCError);

      expect(console.error).toHaveBeenCalledWith(
        'Failed to unban user:',
        expect.any(Error)
      );
    });
  });
});
