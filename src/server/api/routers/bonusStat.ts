import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const isAdmin = (ctx) => {
  if (ctx.session?.user?.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
};

export const bonusStatRouter = createTRPCRouter({
  getCategories: protectedProcedure.query(async ({ ctx }) => {
    isAdmin(ctx);
    return ctx.db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }),

  createCategory: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      return ctx.db.category.create({
        data: { name: input },
      });
    }),

  updateCategory: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      return ctx.db.category.update({
        where: { id: input.id },
        data: { name: input.name },
      });
    }),

  deleteCategory: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      // First, delete all bonus stats associated with this category
      await ctx.db.bonusStat.deleteMany({
        where: { categoryId: input },
      });
      // Then delete the category
      return ctx.db.category.delete({
        where: { id: input },
      });
    }),

  getAllItems: protectedProcedure.query(async ({ ctx }) => {
    isAdmin(ctx);
    return ctx.db.bonusStat.findMany({
      include: { category: true },
      orderBy: [
        { category: { name: 'asc' } },
        { order: 'asc' },
      ],
    });
  }),

  createItem: protectedProcedure
    .input(z.object({
      name: z.string(),
      effect: z.string(),
      categoryId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      const category = await ctx.db.category.findUnique({
        where: { id: input.categoryId },
      });
      if (!category) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });
      }
      const highestOrder = await ctx.db.bonusStat.findFirst({
        where: { categoryId: category.id },
        orderBy: { order: 'desc' },
        select: { order: true },
      });
      const newOrder = (highestOrder?.order ?? -1) + 1;
      return ctx.db.bonusStat.create({
        data: {
          name: input.name,
          effect: input.effect,
          categoryId: input.categoryId,
          order: newOrder,
        },
      });
    }),

  updateItem: protectedProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      effect: z.string(),
      categoryId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      const { id, ...data } = input;
      return ctx.db.bonusStat.update({
        where: { id },
        data,
      });
    }),

  deleteItem: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      return ctx.db.bonusStat.delete({
        where: { id: input },
      });
    }),

  reorder: protectedProcedure
    .input(z.object({
      categoryId: z.string(),
      sourceIndex: z.number(),
      destinationIndex: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx);
      const { categoryId, sourceIndex, destinationIndex } = input;

      const stats = await ctx.db.bonusStat.findMany({
        where: { categoryId },
        orderBy: { order: 'asc' },
      });
      const [reorderedStat] = stats.splice(sourceIndex, 1);
      stats.splice(destinationIndex, 0, reorderedStat);
      await Promise.all(stats.map((stat, index) =>
        ctx.db.bonusStat.update({
          where: { id: stat.id },
          data: { order: index },
        })
      ));
      return { success: true };
    }),
});