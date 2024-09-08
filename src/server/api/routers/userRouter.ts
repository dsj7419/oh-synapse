import { z } from "zod";
import { createTRPCRouter, protectedProcedure, moderatorProcedure } from "@/server/api/trpc";
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

      const elevatedEmail = process.env.DISCORD_ELEVATED_USER_ID;

      try {
        const role = await ctx.db.role.findUnique({ where: { id: roleId } });
        if (!role) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Role not found." });
        }

        const isElevatedUser = ctx.session.user.email === elevatedEmail;

        // Prevent removing 'viewer' role for all users
        if (role.name === 'viewer' && !assign) {
          throw new TRPCError({ code: "FORBIDDEN", message: "The 'viewer' role cannot be removed." });
        }

        // Prevent regular users from managing their own roles
        if (!isElevatedUser && userId === ctx.session.user.id) {
          throw new TRPCError({ code: "FORBIDDEN", message: "You cannot manage your own roles." });
        }

        // Prevent elevated users from managing their own 'admin' or 'viewer' roles
        if (isElevatedUser && userId === ctx.session.user.id && role.name === 'admin') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Elevated users cannot manage their own admin role." });
        }

        if (isElevatedUser && userId === ctx.session.user.id && role.name === 'viewer') {
          throw new TRPCError({ code: "FORBIDDEN", message: "Elevated users cannot manage their own viewer role." });
        }

        // Proceed with role assignment/removal
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
          roles: updatedUser.roles.map(ur => ur.role.name),
        };
      } catch (error) {
        console.error("Failed to update user role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to update user role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  banUser: moderatorProcedure
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
    }),

  unbanUser: moderatorProcedure
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
    }),
});
