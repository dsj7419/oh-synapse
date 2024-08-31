import { z } from "zod";
import { createTRPCRouter, adminProcedure } from "@/server/api/trpc";

export const categoryRouter = createTRPCRouter({
  getAll: adminProcedure.query(async ({ ctx }) => {
    return ctx.db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }),
});