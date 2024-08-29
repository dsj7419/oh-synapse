import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const recipeInputSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum(['Food', 'Drink']),
  description: z.string(),
  baseStats: z.record(z.string(), z.any()),
  foodEffect: z.string(),
  optionalIngredient: z.string().optional(),
  ingredient1: z.string(),
  ingredient2: z.string(),
  ingredient3: z.string().optional(),
  ingredient4: z.string().optional(),
  baseSpoilageRate: z.string(),
  craftingStation: z.string(),
  recipeLocation: z.string(),
  rarity: z.enum(['common', 'uncommon', 'rare', 'unique']),
  image: z.string().nullable().optional(),
});

export const recipeRouter = createTRPCRouter({
  createOrUpdate: protectedProcedure
    .input(recipeInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!['admin', 'recipeEditor'].includes(ctx.session.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      if (input.id) {
        return ctx.db.recipe.update({
          where: { id: input.id },
          data: input,
        });
      } else {
        return ctx.db.recipe.create({
          data: { ...input, createdBy: { connect: { id: ctx.session.user.id } } },
        });
      }
    }),
  getAll: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(),
      search: z.string().optional(),
      type: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, search, type } = input;
      const recipes = await ctx.db.recipe.findMany({
        take: limit + 1,
        where: {
          AND: [
            search ? { name: { contains: search, mode: 'insensitive' } } : {},
            type ? { type } : {},
          ],
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: 'asc' },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (recipes.length > limit) {
        const nextItem = recipes.pop();
        nextCursor = nextItem!.id;
      }
      return {
        recipes,
        nextCursor,
      };
    }),
  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const recipe = await ctx.db.recipe.findUnique({
        where: { id: input },
        include: { createdBy: true, location: true }, // Assuming 'createdBy' and 'location' are relations you want to include
      });
      if (!recipe) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return recipe;
    }),
  delete: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!['admin', 'recipeEditor'].includes(ctx.session.user.role)) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.recipe.delete({
        where: { id: input },
      });
    }),
  markAsFound: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session.user) {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return ctx.db.userRecipe.create({
        data: {
          userId: ctx.session.user.id,
          recipeId: input,
        },
      });
    }),
});

