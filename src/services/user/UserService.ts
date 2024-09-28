import type { PrismaClient, User } from '@prisma/client';
import { TRPCError } from '@trpc/server';
import { logAction } from "@/utils/auditLogger";

export interface UserWithRoles extends User {
  roles: string[];
}

interface SessionUser {
  id: string;
  name?: string | null;
  email?: string | null;
  roles: string[];
}

export class UserService {
  constructor(private prisma: PrismaClient) {}

  async getAllUsers(): Promise<UserWithRoles[]> {
    try {
      const users = await this.prisma.user.findMany({
        include: {
          roles: {
            include: { role: true }
          }
        }
      });
      return users.map(user => ({
        ...user,
        roles: user.roles.map(ur => ur.role.name)
      }));
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Error fetching users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  async updateUserRoles(
    userId: string,
    roleId: string,
    assign: boolean,
    currentUser: SessionUser
  ): Promise<UserWithRoles> {
    try {
      const role = await this.prisma.role.findUnique({ where: { id: roleId } });
      if (!role) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
      }

      if (assign) {
        await this.prisma.userRole.upsert({
          where: { userId_roleId: { userId, roleId } },
          update: {},
          create: { userId, roleId, assignedBy: currentUser.id },
        });
      } else {
        await this.prisma.userRole.deleteMany({ where: { userId, roleId } });
      }

      const updatedUser = await this.prisma.user.findUnique({
        where: { id: userId },
        include: { roles: { include: { role: true } } },
      });

      if (!updatedUser) {
        throw new TRPCError({ code: "NOT_FOUND", message: "User not found after updating roles." });
      }

      await logAction({
        userId: currentUser.id,
        username: currentUser.name ?? 'unknown',
        userRole: currentUser.roles.join(', '),
        action: assign ? 'assign role' : 'remove role',
        resourceType: 'user role',
        resourceId: userId,
        severity: 'high',
        details: {
          roleId,
          roleName: role.name,
          action: assign ? 'assigned' : 'unassigned',
        },
      });

      return {
        ...updatedUser,
        roles: updatedUser.roles.map(ur => ur.role.name),
      };
    } catch (error) {
      console.error("Failed to update user role:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  async banUser(userId: string, currentUser: SessionUser): Promise<UserWithRoles> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { banned: true },
        include: { roles: { include: { role: true } } },
      });

      await logAction({
        userId: currentUser.id,
        username: currentUser.name ?? 'unknown',
        userRole: currentUser.roles.join(', '),
        action: 'ban user',
        resourceType: 'user',
        resourceId: userId,
        severity: 'severe',
        details: {
          bannedUserId: userId,
          bannedUsername: updatedUser.name ?? 'unknown',
          bannedUserEmail: updatedUser.email ?? 'unknown',
        },
      });

      return {
        ...updatedUser,
        roles: updatedUser.roles.map(ur => ur.role.name),
      };
    } catch (error) {
      console.error("Failed to ban user:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to ban user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }

  async unbanUser(userId: string, currentUser: SessionUser): Promise<UserWithRoles> {
    try {
      const updatedUser = await this.prisma.user.update({
        where: { id: userId },
        data: { banned: false },
        include: { roles: { include: { role: true } } },
      });

      await logAction({
        userId: currentUser.id,
        username: currentUser.name ?? 'unknown',
        userRole: currentUser.roles.join(', '),
        action: 'unban user',
        resourceType: 'user',
        resourceId: userId,
        severity: 'high',
        details: {
          unbannedUserId: userId,
          unbannedUsername: updatedUser.name ?? 'unknown',
          unbannedUserEmail: updatedUser.email ?? 'unknown',
        },
      });

      return {
        ...updatedUser,
        roles: updatedUser.roles.map(ur => ur.role.name),
      };
    } catch (error) {
      console.error("Failed to unban user:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Failed to unban user: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }
}