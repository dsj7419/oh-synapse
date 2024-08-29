import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

// Helper function to check admin role
const isAdmin = (ctx) => {
  if (ctx.session?.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
};

export const categoryRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    isAdmin(ctx);
    return ctx.db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }),
  
});
