import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure, moderatorProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({ 
        code: "UNAUTHORIZED", 
        message: "You must be logged in to access user data" 
      });
    }

    try {
      const users = await ctx.db.user.findMany({
        include: {
          roles: {
            include: {
              role: true
            }
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
  }),

  updateRoles: protectedProcedure
    .input(z.object({
      userId: z.string(),
      roleId: z.string(),
      assign: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { userId, roleId, assign } = input;

      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User session is not available." });
      }

      try {
        // Check if the current user has permission to manage this role
        const role = await ctx.db.role.findUnique({ where: { id: roleId } });
        if (!role) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
        }

        const currentUserRoles = await ctx.db.userRole.findMany({
          where: { userId: ctx.session.user.id },
          include: { role: true }
        });

        const canManageRole = role.name === 'admin' 
          ? currentUserRoles.some(ur => ur.role.name === 'admin')
          : currentUserRoles.some(ur => ur.role.name === 'admin' || ur.role.name === role.name);

        if (!canManageRole) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You don't have permission to manage this role." });
        }

        // Prevent removing 'viewer' role
        if (role.name === 'viewer' && !assign) {
          throw new TRPCError({ code: "FORBIDDEN", message: "The 'viewer' role cannot be removed." });
        }

        // Prevent self-role management
        if (userId === ctx.session.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You cannot manage your own roles." });
        }

        if (assign) {
          await ctx.db.userRole.upsert({
            where: {
              userId_roleId: {
                userId,
                roleId,
              },
            },
            update: {},
            create: {
              userId,
              roleId,
              assignedBy: ctx.session.user.id,
            },
          });
        } else {
          await ctx.db.userRole.deleteMany({
            where: {
              userId,
              roleId,
            },
          });
        }

        await ctx.db.auditLog.create({
          data: {
            action: assign ? "ROLE_ASSIGNED" : "ROLE_REMOVED",
            details: { userId, roleId },
            userId: ctx.session.user.id,
          },
        });

        const updatedUser = await ctx.db.user.findUnique({
          where: { id: userId },
          include: { roles: { include: { role: true } } },
        });

        if (!updatedUser) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "User not found after updating roles.",
          });
        }

        return {
          ...updatedUser,
          roles: updatedUser.roles.map(ur => ur.role.name)
        };
      } catch (error) {
        console.error("Failed to update user role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  ban: moderatorProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User session is not available." });
      }

      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: { banned: true },
          include: { roles: { include: { role: true } } },
        });

        await ctx.db.auditLog.create({
          data: {
            action: "USER_BANNED",
            details: { userId },
            userId: ctx.session.user.id,
          },
        });

        return {
          ...updatedUser,
          roles: updatedUser.roles.map(ur => ur.role.name)
        };
      } catch (error) {
        console.error("Failed to ban user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to ban user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  unban: moderatorProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { userId } = input;

      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "User session is not available." });
      }

      try {
        const updatedUser = await ctx.db.user.update({
          where: { id: userId },
          data: { banned: false },
          include: { roles: { include: { role: true } } },
        });

        await ctx.db.auditLog.create({
          data: {
            action: "USER_UNBANNED",
            details: { userId },
            userId: ctx.session.user.id,
          },
        });

        return {
          ...updatedUser,
          roles: updatedUser.roles.map(ur => ur.role.name)
        };
      } catch (error) {
        console.error("Failed to unban user:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to unban user: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),
});