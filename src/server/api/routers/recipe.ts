import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  editorProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { logAction } from "@/utils/auditLogger";

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
  rarity: z.enum(['common', 'uncommon', 'rare', 'unique']),
  image: z.string().nullable().optional(),
  isComplete: z.boolean().optional(),
  locationType: z.enum(['memetics', 'worldMap']),
});

export const recipeRouter = createTRPCRouter({
  createOrUpdate: editorProcedure
    .input(recipeInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { id, ...dataToSave } = input;

      const isUpdate = !!id;

      const recipe = isUpdate
        ? await ctx.db.recipe.update({
            where: { id },
            data: dataToSave,
          })
        : await ctx.db.recipe.create({
            data: {
              ...dataToSave,
              createdBy: { connect: { id: ctx.session.user.id } },
            },
          });

      await logAction({
        userId: ctx.session.user.id,
        username: ctx.session.user.name ?? 'Unknown',
        userRole: ctx.session.user.roles.join(', '),
        action: isUpdate ? 'Update Recipe' : 'Create Recipe',
        severity: isUpdate ? 'medium' : 'normal',
        resourceType: 'Recipe',
        resourceId: recipe.id,
        details: {
          name: recipe.name,
          type: recipe.type,
          description: recipe.description,
          baseStats: recipe.baseStats,
          foodEffect: recipe.foodEffect,
          rarity: recipe.rarity,
          isComplete: recipe.isComplete,
          locationType: recipe.locationType,
        },
      });

      return recipe;
    }),

  getAll: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        search: z.string().optional(),
        type: z.string().optional(),
        rarity: z.string().optional(),
        locationType: z.string().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, search, type, rarity, locationType } = input;

      const recipes = await ctx.db.recipe.findMany({
        take: limit + 1,
        where: {
          AND: [
            search ? { name: { contains: search, mode: 'insensitive' } } : {},
            type ? { type } : {},
            rarity ? { rarity } : {},
            locationType ? { locationType } : {},
          ],
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: 'asc' },
        include: {
          location: true,
          foundBy: ctx.session?.user
            ? {
                where: { userId: ctx.session.user.id },
              }
            : false,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (recipes.length > limit) {
        const nextItem = recipes.pop();
        nextCursor = nextItem?.id;
      }

      return {
        recipes: recipes.map((recipe) => ({
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
        throw new TRPCError({ code: "NOT_FOUND", message: "Recipe not found" });
      }

      return recipe;
    }),

  toggleFound: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: recipeId }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const existingUserRecipe = await ctx.db.userRecipe.findUnique({
        where: {
          userId_recipeId: {
            userId: ctx.session.user.id,
            recipeId: recipeId,
          },
        },
      });

      const found = !existingUserRecipe;

      if (found) {
        await ctx.db.userRecipe.create({
          data: {
            userId: ctx.session.user.id,
            recipeId: recipeId,
          },
        });
      } else if (existingUserRecipe) {
        await ctx.db.userRecipe.delete({
          where: { id: existingUserRecipe.id },
        });
      }

      await logAction({
        userId: ctx.session.user.id,
        username: ctx.session.user.name ?? 'Unknown',
        userRole: ctx.session.user.roles.join(', '),
        action: found ? 'Mark Recipe as Found' : 'Mark Recipe as Unfound',
        severity: 'normal',
        resourceType: 'Recipe',
        resourceId: recipeId,
        details: { recipeId, found },
      });

      return { found };
    }),

  delete: editorProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const recipe = await ctx.db.recipe.delete({
        where: { id: input },
      });
      await logAction({
        userId: ctx.session?.user.id ?? 'Unknown',
        username: ctx.session?.user.name ?? 'Unknown',
        userRole: ctx.session?.user.roles.join(', ') ?? 'Unknown',
        action: 'Delete Recipe',
        severity: 'high',
        resourceType: 'Recipe',
        resourceId: recipe.id,
        details: {
          name: recipe.name,
          id: recipe.id,
        },
      });

      return recipe;
    }),

  markAsFound: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.userRecipe.create({
        data: {
          userId: ctx.session.user.id,
          recipeId: input,
        },
      });
    }),
});
