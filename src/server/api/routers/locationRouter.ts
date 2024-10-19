import { z } from 'zod';
import {
  createTRPCRouter,
  protectedProcedure,
  editorProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { logServerAction } from "@/server/audit";

const locationInputSchema = z.object({
  id: z.string().optional(),
  recipeId: z.string(),
  coordinates: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  image1: z.string().nullable().optional(),
  image2: z.string().nullable().optional(),
  region: z.string().nullable().optional(),
  locationName: z.string().nullable().optional(),
});

export const locationRouter = createTRPCRouter({
  createOrUpdateLocation: editorProcedure
    .input(locationInputSchema)
    .mutation(async ({ ctx, input }) => {
      if (!ctx.session?.user) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { id, recipeId, ...dataToSave } = input;

      const isUpdate = !!id;

      let location;

      if (isUpdate) {
        location = await ctx.db.recipeLocation.update({
          where: { id },
          data: dataToSave,
        });
      } else {
        const existingLocation = await ctx.db.recipeLocation.findUnique({
          where: { recipeId },
        });

        if (existingLocation) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'A location already exists for this recipe.',
          });
        }

        location = await ctx.db.recipeLocation.create({
          data: {
            recipeId,
            ...dataToSave,
          },
        });
      }

      const recipe = await ctx.db.recipe.findUnique({
        where: { id: recipeId },
        select: { locationType: true },
      });

      if (recipe?.locationType === 'worldMap') {
        await ctx.db.recipe.update({
          where: { id: recipeId },
          data: {
            isComplete: true,
          },
        });
      }

      await logServerAction({
        userId: ctx.session.user.id,
        username: ctx.session.user.name ?? 'Unknown',
        userRole: ctx.session.user.roles.join(', '),
        action: isUpdate ? 'Update Location' : 'Create Location',
        severity: isUpdate ? 'medium' : 'normal',
        resourceType: 'RecipeLocation',
        resourceId: location.id,
        details: {
          recipeId,
          coordinates: input.coordinates,
          description: input.description,
          region: input.region,
          locationName: input.locationName,
        },
      });

      return location;
    }),

  getByRecipeId: protectedProcedure
    .input(z.string())
    .query(async ({ ctx, input: recipeId }) => {
      const location = await ctx.db.recipeLocation.findUnique({
        where: { recipeId },
      });

      if (!location) {
        return null; 
      }

      return location;
    }),

  getAllRecipesWithLocations: protectedProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.string().nullish(),
        search: z.string().optional(),
        hasLocation: z.boolean().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor, search, hasLocation } = input;

      const recipes = await ctx.db.recipe.findMany({
        take: limit + 1,
        where: {
          AND: [
            search ? { name: { contains: search, mode: 'insensitive' } } : {},
          ],
        },
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: { name: 'asc' },
        include: {
          location: true,
        },
      });

      let nextCursor: typeof cursor | undefined = undefined;
      if (recipes.length > limit) {
        const nextItem = recipes.pop();
        nextCursor = nextItem?.id;
      }

      const filteredRecipes =
        hasLocation !== undefined
          ? recipes.filter((recipe) =>
              hasLocation ? recipe.location !== null : recipe.location === null
            )
          : recipes;

      return {
        recipes: filteredRecipes,
        nextCursor,
      };
    }),
});
