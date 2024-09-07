import { z } from "zod";
import { createTRPCRouter, publicProcedure, adminProcedure, editorProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { logAction } from "@/utils/auditLogger";
import { Prisma } from "@prisma/client"; // Correct Prisma import

export const bonusStatRouter = createTRPCRouter({
  // Public procedure to get categories (accessible to everyone)
  getCategories: publicProcedure.query(async ({ ctx }) => {
    const categories = await ctx.db.category.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
    if (!categories) throw new TRPCError({ code: 'NOT_FOUND', message: 'Categories not found' });
    return categories;
  }),

  // Admin procedure to create a new category
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
      await logAction({
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

  // Admin procedure to update a category
  updateCategory: adminProcedure
    .input(z.object({
      id: z.string(),
      name: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to update a category" });
      }

      // Fetch the original category for comparison
      const originalCategory = await ctx.db.category.findUnique({
        where: { id: input.id }
      });
      if (!originalCategory) throw new TRPCError({ code: 'NOT_FOUND', message: 'Category not found' });

      const updatedCategory = await ctx.db.category.update({
        where: { id: input.id },
        data: { name: input.name },
      });

      // Log the update action
      await logAction({
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

  // Admin procedure to delete a category
  deleteCategory: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to delete a category" });
      }

      // Fetch the original category for logging
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

      // Log the deletion action
      await logAction({
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

  // Public procedure to fetch all bonus stats (accessible to everyone)
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

  // Editor procedure to create a new bonus stat
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

      // Fetch the highest order within the same categoryId
      const highestOrderForCategory = await ctx.db.bonusStat.findFirst({
        where: { categoryId: input.categoryId },
        orderBy: { order: 'desc' },
        select: { order: true },
      });

      // Assign the new order value
      const newOrder = (highestOrderForCategory?.order ?? -1) + 1;

      // Create the new item with the calculated order
      const newItem = await ctx.db.bonusStat.create({
        data: {
          name: input.name,
          effect: input.effect,
          categoryId: input.categoryId,
          order: newOrder,
        },
      });

      // Log the creation action
      await logAction({
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

  // Editor procedure to update a bonus stat
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

      // Log the update action
      await logAction({
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

  // Editor procedure to delete a bonus stat
  deleteItem: editorProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "You must be logged in to delete a bonus stat" });
      }

      const deletedItem = await ctx.db.bonusStat.delete({
        where: { id: input },
      });

      // Log the deletion action
      await logAction({
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

  // Public procedure to fetch bonus stats by category
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

  // Reordering logic with category awareness
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

      // Fetch all items for the given category, ordered by their 'order' field
      const stats = await ctx.db.bonusStat.findMany({
        where: { categoryId },
        orderBy: { order: 'asc' },
      });

      if (!stats.length) throw new TRPCError({ code: 'NOT_FOUND', message: 'No stats found for this category' });

      const draggedItem = stats[sourceIndex];
      if (!draggedItem) throw new TRPCError({ code: 'BAD_REQUEST', message: 'Invalid source index' });

      // Temporary high order to prevent conflicts
      const tempOrder = 9999;
      await ctx.db.bonusStat.update({
        where: { id: draggedItem.id },
        data: { order: tempOrder },
      });

      let previousOrder = draggedItem.order;  // Store original order of the dragged item
      let direction = destinationIndex > sourceIndex ? 'down' : 'up';

      if (direction === 'down') {
        // Moving item down: Shift items upwards
        for (let i = sourceIndex + 1; i <= destinationIndex; i++) {
          const currentItem = stats[i];
          if (!currentItem) continue;  // Skip if currentItem is undefined

          const currentOrder = currentItem.order;

          // Move the current item to the previous item's position
          await ctx.db.bonusStat.update({
            where: { id: currentItem.id },
            data: { order: previousOrder },
          });

          // Shift the previous order to the current order
          previousOrder = currentOrder;
        }
      } else {
        // Moving item up: Shift items downwards
        for (let i = sourceIndex - 1; i >= destinationIndex; i--) {
          const currentItem = stats[i];
          if (!currentItem) continue;  // Skip if currentItem is undefined

          const currentOrder = currentItem.order;

          // Move the current item to the previous item's position
          await ctx.db.bonusStat.update({
            where: { id: currentItem.id },
            data: { order: previousOrder },
          });

          // Shift the previous order to the current order
          previousOrder = currentOrder;
        }
      }

      // Now place the dragged item in the final destination
      await ctx.db.bonusStat.update({
        where: { id: draggedItem.id },
        data: { order: previousOrder },
      });

      // Log the reorder action
      await logAction({
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
