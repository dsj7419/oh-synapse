import { z } from "zod";
import { createTRPCRouter, protectedProcedure, publicProcedure, editorProcedure } from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";

const recipeInputSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  type: z.enum(['Food', 'Drink', 'Crafted Ingredient']),
  description: z.string(),
  baseStats: z.record(z.string(), z.any()),
  foodEffect: z.string(),
  optionalIngredient: z.string().nullable().optional(),
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
  createOrUpdate: editorProcedure
    .input(recipeInputSchema)
    .mutation(async ({ ctx, input }) => {
      const dataToSave = {
        ...input,
        image: input.image ?? null,
      };
      if (input.id) {
        return ctx.db.recipe.update({
          where: { id: input.id },
          data: dataToSave,
        });
      } else {
        return ctx.db.recipe.create({
          data: { ...dataToSave, createdBy: { connect: { id: ctx.session.user.id } } },
        });
      }
    }),

  toggleFound: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: recipeId }) => {
      const existingUserRecipe = await ctx.db.userRecipe.findUnique({
        where: {
          userId_recipeId: {
            userId: ctx.session.user.id,
            recipeId: recipeId,
          },
        },
      });

      if (existingUserRecipe) {
        await ctx.db.userRecipe.delete({
          where: { id: existingUserRecipe.id },
        });
        return { found: false };
      } else {
        await ctx.db.userRecipe.create({
          data: {
            userId: ctx.session.user.id,
            recipeId: recipeId,
          },
        });
        return { found: true };
      }
    }),

  getAll: publicProcedure
    .input(z.object({
      limit: z.number().min(1).max(100).nullish(),
      cursor: z.string().nullish(),
      search: z.string().optional(),
      type: z.string().optional(),
      rarity: z.string().optional(),
    }))
    .query(async ({ ctx, input }) => {
        const limit = input.limit ?? 50;
        const { cursor, search, type, rarity } = input;
        const recipes = await ctx.db.recipe.findMany({
          take: limit + 1,
          where: {
            AND: [
              search ? { name: { contains: search, mode: 'insensitive' } } : {},
              type ? { type } : {},
              rarity ? { rarity } : {},
            ],
          },
          cursor: cursor ? { id: cursor } : undefined,
          orderBy: { name: 'asc' },
          include: {
            location: true,
            foundBy: ctx.session ? {
              where: { userId: ctx.session.user.id }
            } : false,
          },
        });

        let nextCursor: typeof cursor | undefined = undefined;
        if (recipes.length > limit) {
          const nextItem = recipes.pop();
          nextCursor = nextItem!.id;
        }

        return {
          recipes: recipes.map(recipe => ({
            ...recipe,
            isFound: recipe.foundBy && recipe.foundBy.length > 0,
          })),
          nextCursor,
        };
      }),

  getById: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      const recipe = await ctx.db.recipe.findUnique({
        where: { id: input },
        include: { createdBy: true, location: true }, 
      });
      if (!recipe) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      return recipe;
    }),

  delete: editorProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.recipe.delete({
        where: { id: input },
      });
    }),

  markAsFound: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      return ctx.db.userRecipe.create({
        data: {
          userId: ctx.session.user.id,
          recipeId: input,
        },
      });
    }),
});