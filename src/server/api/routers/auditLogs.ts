import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod"; 

export const auditLogsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        cursor: z.string().optional(), 
        limit: z.number().optional().default(10), 
      })
    )
    .query(async ({ ctx, input }) => {
      try {
        const limit = input.limit ?? 10;
        const cursor = input.cursor;

        const logs = await ctx.db.auditLog.findMany({
          take: limit + 1, 
          skip: cursor ? 1 : 0,
          cursor: cursor ? { id: cursor } : undefined, 
          orderBy: { timestamp: "desc" }, 
          select: {
            id: true,
            timestamp: true,
            userId: true,
            username: true,
            userRole: true,
            action: true,
            severity: true, 
            resourceType: true,
            resourceId: true,
            details: true,
            ipAddress: true,
            status: true,
            createdAt: true,
            archived: true,
          },
        });

        const hasMore = logs.length > limit;
        const nextCursor = hasMore ? logs.pop()?.id : null; 

        return {
          items: logs, 
          nextCursor, 
        };
      } catch (error) {
        console.error("Error fetching audit logs:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Error fetching audit logs",
        });
      }
    }),
});
