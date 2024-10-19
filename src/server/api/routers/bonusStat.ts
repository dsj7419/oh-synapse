import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure, editorProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { logServerAction } from "@/server/audit";

export const bonusStatRouter = createTRPCRouter({
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    if (!categories) throw new TRPCError({ code: 'NOT_FOUND', message: 'Categories not found' });
    return categories;
  }),

  createCategory: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to create a category" });
      }

      const newCategory = await ctx.db.category.create({
        data: { name: input },
      });

      // Log the creation action
      await logServerAction({
        userId: ctx.session.user.id,
        username: ctx.session.user.name ?? 'Unknown',
        userRole: ctx.session.user.roles.join(', '),
        action: 'Create Category',
        resourceType: 'Category',
        resourceId: newCategory.id,
        severity: 'normal', 
        details: { name: input },
      });

      return newCategory;
    }),

  updateCategory: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to update a category" });
      }

      const originalCategory = await ctx.db.category.findUnique({
        where: { id: input.id }
      });
      if (!originalCategory) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });

      const updatedCategory = await ctx.db.category.update({
        where: { id: input.id },
        data: { name: input.name },
      });

      await logServerAction({
        userId: ctx.session.user.id,
        username: ctx.session.user.name ?? 'Unknown',
        userRole: ctx.session.user.roles.join(', '),
        action: 'Update Category',
        resourceType: 'Category',
        resourceId: input.id,
        severity: 'medium',
        details: {
          before: { name: originalCategory.name },
          after: { name: input.name }
        },
      });

      return updatedCategory;
    }),

  deleteCategory: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to delete a category" });
      }

      const originalCategory = await ctx.db.category.findUnique({
        where: { id: input }
      });
      if (!originalCategory) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });

      await ctx.db.bonusStat.deleteMany({
        where: { categoryId: input },
      });

      const deletedCategory = await ctx.db.category.delete({
        where: { id: input },
      });

      await logServerAction({
        userId: ctx.session.user.id,
        username: ctx.session.user.name ?? 'Unknown',
        userRole: ctx.session.user.roles.join(', '),
        action: 'Delete Category',
        resourceType: 'Category',
        resourceId: input,
        severity: 'high',
        details: { id: input, name: originalCategory.name },
      });

      return deletedCategory;
    }),

  getAllItems: publicProcedure.query(async ({ ctx }) => {
    const items = await ctx.db.bonusStat.findMany({
      include: { category: true },
      orderBy: [
        { category: { name: 'asc' } },
        { order: 'asc' },
      ],
    });
    if (!items) throw new TRPCError({ code: 'NOT_FOUND', message: 'No items found' });
    return items;
  }),

  createItem: editorProcedure
    .input(z.object({
      name: z.string(),
      effect: z.string(),
      categoryId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to create a bonus stat" });
      }

      const highestOrderForCategory = await ctx.db.bonusStat.findFirst({
        where: { categoryId: input.categoryId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      const newOrder = (highestOrderForCategory?.order ?? -1) + 1;

      const newItem = await ctx.db.bonusStat.create({
        data: {
          name: input.name,
          effect: input.effect,
          categoryId: input.categoryId,
          order: newOrder,
        },
      });

      await logServerAction({
        userId: ctx.session.user.id,
        username: ctx.session.user.name ?? 'Unknown',
        userRole: ctx.session.user.roles.join(', '),
        action: 'Create Bonus Stat',
        resourceType: 'Bonus Stat',
        resourceId: newItem.id,
        severity: 'normal',
        details: { name: input.name, effect: input.effect, categoryId: input.categoryId },
      });

      return newItem;
    }),

  updateItem: editorProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
      effect: z.string(),
      categoryId: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to update a bonus stat" });
      }

      const originalItem = await ctx.db.bonusStat.findUnique({
        where: { id: input.id },
      });

      const updatedItem = await ctx.db.bonusStat.update({
        where: { id: input.id },
        data: {
          name: input.name,
          effect: input.effect,
          categoryId: input.categoryId,
        },
      });

      await logServerAction({
        userId: ctx.session.user.id,
        username: ctx.session.user.name ?? 'Unknown',
        userRole: ctx.session.user.roles.join(', '),
        action: 'Update Bonus Stat',
        resourceType: 'Bonus Stat',
        resourceId: input.id,
        severity: 'medium',
        details: {
          before: { name: originalItem?.name, effect: originalItem?.effect },
          after: { name: input.name, effect: input.effect }
        }
      });

      return updatedItem;
    }),

  deleteItem: editorProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to delete a bonus stat" });
      }

      const deletedItem = await ctx.db.bonusStat.delete({
        where: { id: input },
      });

      await logServerAction({
        userId: ctx.session.user.id,
        username: ctx.session.user.name ?? 'Unknown',
        userRole: ctx.session.user.roles.join(', '),
        action: 'Delete Bonus Stat',
        resourceType: 'Bonus Stat',
        resourceId: input,
        severity: 'high',
        details: { id: input, name: deletedItem.name },
      });

      return deletedItem;
    }),

  getByCategory: publicProcedure
    .input(z.object({
      categoryId: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.db.bonusStat.findMany({
        where: { categoryId: input.categoryId },
        orderBy: { order: 'asc' },
      });
      if (!items) throw new TRPCError({ code: 'NOT_FOUND', message: 'No items found for this category' });
      return items;
    }),

  reorder: editorProcedure
    .input(z.object({
      categoryId: z.string(),
      sourceIndex: z.number(),
      destinationIndex: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to reorder bonus stats" });
      }

      const { categoryId, sourceIndex, destinationIndex } = input;

      const stats = await ctx.db.bonusStat.findMany({
        where: { categoryId },
        orderBy: { order: 'asc' },
      });

      if (!stats.length) throw new TRPCError({ code: 'NOT_FOUND', message: 'No stats found for this category' });

      const draggedItem = stats[sourceIndex];
      if (!draggedItem) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid source index' });

      const tempOrder = 9999;
      await ctx.db.bonusStat.update({
        where: { id: draggedItem.id },
        data: { order: tempOrder },
      });

      let previousOrder = draggedItem.order; 
      const direction = destinationIndex > sourceIndex ? 'down' : 'up';

      if (direction === 'down') {
        for (let i = sourceIndex + 1; i <= destinationIndex; i++) {
          const currentItem = stats[i];
          if (!currentItem) continue;  

          const currentOrder = currentItem.order;

          await ctx.db.bonusStat.update({
            where: { id: currentItem.id },
            data: { order: previousOrder },
          });

          previousOrder = currentOrder;
        }
      } else {
        for (let i = sourceIndex - 1; i >= destinationIndex; i--) {
          const currentItem = stats[i];
          if (!currentItem) continue; 

          const currentOrder = currentItem.order;

          await ctx.db.bonusStat.update({
            where: { id: currentItem.id },
            data: { order: previousOrder },
          });

          previousOrder = currentOrder;
        }
      }

      await ctx.db.bonusStat.update({
        where: { id: draggedItem.id },
        data: { order: previousOrder },
      });

      await logServerAction({
        userId: ctx.session.user.id,
        username: ctx.session.user.name ?? 'Unknown',
        userRole: ctx.session.user.roles.join(', '),
        action: 'Reorder Bonus Stats',
        resourceType: 'Bonus Stat',
        resourceId: draggedItem.id,
        severity: 'medium',
        details: { categoryId, sourceIndex, destinationIndex },
      });

      return { success: true };
    }),
  });
