import { z } from "zod";
import { createTRPCRouter, protectedProcedure, adminProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

export const roleRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    console.log("Entering role.getAll procedure");
    console.log("Context in role.getAll:", {
      session: ctx.session ? {
        user: ctx.session.user ? {
          id: ctx.session.user.id,
          roles: ctx.session.user.roles
        } : null
      } : null
    });

    if (!ctx.session || !ctx.session.user) {
      console.log("Unauthorized access attempt in role.getAll");
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access roles"
      });
    }

    try {
      console.log("Attempting to fetch roles from database");
      const roles = await ctx.db.role.findMany();
      console.log("Roles fetched:", roles.length);
      return roles;
    } catch (error) {
      console.error("Error fetching roles:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: `Error fetching roles: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }),

  create: adminProcedure
    .input(z.object({
      name: z.string(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const newRole = await ctx.db.role.create({
          data: input,
        });
        return newRole;
      } catch (error) {
        console.error("Error creating role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Error creating role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  update: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      try {
        const updatedRole = await ctx.db.role.update({
          where: { id: input.id },
          data: {
            name: input.name,
            description: input.description,
          },
        });
        return updatedRole;
      } catch (error) {
        console.error("Error updating role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Error updating role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),

  delete: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        await ctx.db.role.delete({
          where: { id: input },
        });
        return { success: true };
      } catch (error) {
        console.error("Error deleting role:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Error deleting role: ${error instanceof Error ? error.message : 'Unknown error'}`,
        });
      }
    }),
});