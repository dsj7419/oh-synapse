import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod"; 

export const auditLogsRouter = createTRPCRouter({
  getAll: protectedProcedure
    .input(
      z.object({
        filter: z.string().optional(), 
        severities: z.array(z.string()).optional(),  
        cursor: z.string().optional(), 
        limit: z.number().optional().default(10), 
      })
    )
    .query(async ({ input, ctx }) => {
      const { filter, severities, cursor, limit } = input;

      try {
        const takeLimit = limit ?? 10;

        const logs = await ctx.db.auditLog.findMany({
          take: takeLimit + 1, 
          skip: cursor ? 1 : 0,  
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { timestamp: "desc" },
          where: {
            AND: [
              {
                OR: [
                  { username: { contains: filter ?? '' } },
                  { action: { contains: filter ?? '' } },
                  ...(filter ? [{ createdAt: { gte: new Date(filter), lte: new Date(filter) } }] : []),
                ],
              },
              ...(severities?.length ? [{ severity: { in: severities } }] : []), 
            ],
          },
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

        const hasMore = logs.length > takeLimit;
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
