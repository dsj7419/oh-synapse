import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const isAdmin = (ctx) => {
  if (ctx.session?.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
};

export const bonusStatRouter = createTRPCRouter({
  getAll: protectedProcedure.query(async ({ ctx }) => {
    isAdmin(ctx);
    return ctx.db.bonusStat.findMany({
      orderBy: { order: 'asc' }
    });
  }),

  create: protectedProcedure
    .input(z.object({
      name: z.string(),
      effect: z.string(),
      type: z.enum(['meat', 'fish', 'plant']),
    }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      const highestOrder = await ctx.db.bonusStat.findFirst({
        where: { type: input.type },
        orderBy: { order: 'desc' },
        select: { order: true }
      });
      const newOrder = (highestOrder?.order ?? -1) + 1;
      return ctx.db.bonusStat.create({
        data: {
          ...input,
          order: newOrder
        },
      });
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      effect: z.string(),
      type: z.enum(['meat', 'fish', 'plant']),
    }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      const { id, ...data } = input;
      return ctx.db.bonusStat.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      return ctx.db.bonusStat.delete({
        where: { id: input },
      });
    }),

  reorder: protectedProcedure
    .input(z.object({
      type: z.enum(['meat', 'fish', 'plant']),
      sourceIndex: z.number(),
      destinationIndex: z.number()
    }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      const { type, sourceIndex, destinationIndex } = input;
      
      const stats = await ctx.db.bonusStat.findMany({
        where: { type },
        orderBy: { order: 'asc' }
      });
      const [reorderedStat] = stats.splice(sourceIndex, 1);
      stats.splice(destinationIndex, 0, reorderedStat);
      await Promise.all(stats.map((stat, index) =>
        ctx.db.bonusStat.update({
          where: { id: stat.id },
          data: { order: index }
        })
      ));
      return { success: true };
    }),
});