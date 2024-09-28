import { z } from "zod";
import { createTRPCRouter, protectedProcedure, moderatorProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { UserService } from "@/services/user/UserService";
import { db } from "@/server/db";

const userService = new UserService(db);

export const userRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session || !ctx.session.user) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "You must be logged in to access user data",
      });
    }
    return userService.getAllUsers();
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
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No user session available.",
        });
      }
      const sessionUser = {
        id: ctx.session.user.id,
        name: ctx.session.user.name,
        email: ctx.session.user.email,
        roles: ctx.session.user.roles,
      };
      return userService.updateUserRoles(userId, roleId, assign, sessionUser);
    }),

  banUser: moderatorProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No user session available.",
        });
      }
      const sessionUser = {
        id: ctx.session.user.id,
        name: ctx.session.user.name,
        email: ctx.session.user.email,
        roles: ctx.session.user.roles,
      };
      return userService.banUser(input.userId, sessionUser);
    }),

  unbanUser: moderatorProcedure
    .input(z.object({ userId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message: "No user session available.",
        });
      }
      const sessionUser = {
        id: ctx.session.user.id,
        name: ctx.session.user.name,
        email: ctx.session.user.email,
        roles: ctx.session.user.roles,
      };
      return userService.unbanUser(input.userId, sessionUser);
    }),
});