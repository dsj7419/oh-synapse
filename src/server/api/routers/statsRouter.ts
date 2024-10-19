import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { calculateStats } from "../../statsCalculator";

export const statsRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.session?.user?.roles.includes("admin")) {
      throw new TRPCError({
        code: "FORBIDDEN",
        message: "Only admins can access stats",
      });
    }

    return calculateStats();
  }),
});
