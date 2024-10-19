import { z } from "zod";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
  adminProcedure,
  editorProcedure,
} from "@/server/api/trpc";
import { TRPCError } from "@trpc/server";
import { logServerAction } from "@/server/audit";

const tierInputSchema = z.object({
  id: z.string().optional(),
  tier: z.string(),
  color: z.string(),
  order: z.number().optional(),
});

const tagInputSchema = z.object({
  id: z.string().optional(),
  name: z.string(),
  description: z.string().nullable().optional(),
  color: z.string().nullable().optional(),
});

// Helper function to ensure authentication
const ensureAuth = (ctx: any) => {
  if (!ctx.session?.user) {
    throw new TRPCError({ code: "UNAUTHORIZED" });
  }
  return ctx.session.user;
};

// Helper function for logging actions
const logActionHelper = async (
  ctx: any,
  action: string,
  resourceType: string,
  resourceId: string,
  severity: string,
  details: any,
) => {
  const user = ensureAuth(ctx);
  await logServerAction({
    userId: user.id,
    username: user.name ?? "Unknown",
    userRole: user.roles.join(", "),
    action,
    resourceType,
    resourceId,
    severity,
    details,
  });
};

export const memeticRouter = createTRPCRouter({
  // Tier Management
  getAllTiers: protectedProcedure.query(({ ctx }) => {
    return ctx.db.tier.findMany({
      orderBy: { order: "asc" },
    });
  }),

  createTier: adminProcedure
    .input(tierInputSchema.omit({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);
      const highestOrder = await ctx.db.tier.findFirst({
        where: { tier: { not: "Unassigned" } },
        orderBy: { order: "desc" },
        select: { order: true },
      });

      const newOrder = (highestOrder?.order ?? 0) + 1;

      const newTier = await ctx.db.tier.create({
        data: {
          ...input,
          order: input.order ?? newOrder,
        },
      });

      await logActionHelper(
        ctx,
        "Create Tier",
        "Tier",
        newTier.id,
        "normal",
        input,
      );

      return newTier;
    }),

  updateTier: adminProcedure
    .input(tierInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;
        const updatedTier = await ctx.db.tier.update({
          where: { id },
          data: updateData,
        });

        return updatedTier;
      } catch (error) {
        console.error("Error updating tier:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update tier",
        });
      }
    }),

  deleteTier: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx); // Ensure user is authenticated
      try {
        // Get the 'Unassigned' tier
        const unassignedTier = await ctx.db.tier.findUnique({
          where: { tier: "Unassigned" },
        });

        if (!unassignedTier) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unassigned tier not found",
          });
        }

        // Begin a transaction
        const result = await ctx.db.$transaction(async (prisma) => {
          // Reassign memetics to the 'Unassigned' tier
          await prisma.memetic.updateMany({
            where: { tierId: input },
            data: { tierId: unassignedTier.id },
          });

          // Delete the tier
          const deletedTier = await prisma.tier.delete({
            where: { id: input },
          });

          // Update the order of remaining tiers
          const remainingTiers = await prisma.tier.findMany({
            where: { id: { not: unassignedTier.id } }, // Exclude 'Unassigned' tier
            orderBy: { order: "asc" },
          });

          await Promise.all(
            remainingTiers.map((tier, index) =>
              prisma.tier.update({
                where: { id: tier.id },
                data: { order: index + 1 },
              }),
            ),
          );

          return deletedTier;
        });

        // Log the action outside the transaction
        await logServerAction({
          userId: user.id,
          username: user.name ?? "Unknown",
          userRole: user.roles.join(", ") ?? "Unknown",
          action: "Delete Tier",
          resourceType: "Tier",
          resourceId: input,
          severity: "high",
          details: { deletedTierId: input },
        });

        return result;
      } catch (error) {
        console.error("Error deleting tier:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete tier",
        });
      }
    }),

  updateTierOrder: adminProcedure
    .input(z.array(z.object({ id: z.string(), order: z.number() })))
    .mutation(async ({ ctx, input }) => {
      try {
        // Get the 'Unassigned' tier
        const unassignedTier = await ctx.db.tier.findUnique({
          where: { tier: "Unassigned" },
        });

        if (!unassignedTier) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Unassigned tier not found",
          });
        }

        // Exclude 'Unassigned' tier from ordering
        const tiersToUpdate = input.filter((t) => t.id !== unassignedTier.id);

        await ctx.db.$transaction(async (prisma) => {
          // Increase all current orders by a large number to avoid conflicts
          await prisma.tier.updateMany({
            where: { id: { in: tiersToUpdate.map((t) => t.id) } },
            data: { order: { increment: 1000 } },
          });

          // Update each tier with its new order
          for (const { id, order } of tiersToUpdate) {
            await prisma.tier.update({
              where: { id },
              data: { order },
            });
          }
        });

        await logServerAction({
          userId: ctx.session?.user.id ?? "Unknown",
          username: ctx.session?.user.name ?? "Unknown",
          userRole: ctx.session?.user.roles?.join(", ") ?? "Unknown",
          action: "Update Tier Order",
          resourceType: "Tier",
          resourceId: tiersToUpdate.map((t) => t.id).join(","),
          severity: "low",
          details: { newOrder: input },
        });

        return { success: true };
      } catch (error) {
        console.error("Error updating tier order:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update tier order",
        });
      }
    }),

  getAllTags: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.db.tag.findMany({
      orderBy: { name: "asc" },
    });
  }),

  createTag: adminProcedure
    .input(tagInputSchema.omit({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);
      const newTag = await ctx.db.tag.create({
        data: input,
      });
      await logActionHelper(
        ctx,
        "Create Tag",
        "Tag",
        newTag.id,
        "normal",
        input,
      );
      return newTag;
    }),

  updateTag: adminProcedure
    .input(tagInputSchema.extend({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...updateData } = input;
      const updatedTag = await ctx.db.tag.update({
        where: { id },
        data: updateData,
      });
      await logActionHelper(ctx, "Update Tag", "Tag", id, "normal", updateData);
      return updatedTag;
    }),

  deleteTag: adminProcedure
    .input(z.string())
    .mutation(async ({ ctx, input: tagId }) => {
      // Before deleting the tag, reassign memetics with this tag to the default 'Normal' tag
      const defaultTag = await ctx.db.tag.findFirst({
        where: { name: "Normal" },
      });

      if (!defaultTag) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: 'Default "Normal" tag not found',
        });
      }

      await ctx.db.$transaction(async (prisma) => {
        // Reassign memetics to default tag
        await prisma.memetic.updateMany({
          where: { tagId },
          data: { tagId: defaultTag.id },
        });

        // Delete the tag
        await prisma.tag.delete({
          where: { id: tagId },
        });
      });

      await logActionHelper(ctx, "Delete Tag", "Tag", tagId, "high", {
        deletedTagId: tagId,
      });

      return { success: true };
    }),

  // Memetic Management
  createMemetic: editorProcedure
    .input(
      z.object({
        title: z.string(),
        description: z.string(),
        tierId: z.string(),
        defaultRank: z.number(),
        levelAssignments: z.array(z.number()).optional(),
        tagId: z.string(),
        image: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const existingMemetic = await ctx.db.memetic.findFirst({
          where: {
            tierId: input.tierId,
            defaultRank: input.defaultRank,
          },
        });

        if (existingMemetic) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "A memetic with this rank and tier combination already exists",
          });
        }

        const newMemetic = await ctx.db.memetic.create({
          data: {
            ...input,
            levelAssignments: input.levelAssignments || [],
            image: input.image,
          },
          include: { tier: true, tag: true },
        });

        await logActionHelper(
          ctx,
          "Create Memetic",
          "Memetic",
          newMemetic.id,
          "normal",
          input,
        );

        return newMemetic;
      } catch (error) {
        console.error("Error creating memetic:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create memetic",
        });
      }
    }),

  updateMemetic: editorProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string(),
        description: z.string(),
        tierId: z.string(),
        defaultRank: z.number(),
        levelAssignments: z.array(z.number()).optional(),
        tagId: z.string(),
        image: z.string().nullable().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const { id, ...updateData } = input;

        const existingMemetic = await ctx.db.memetic.findFirst({
          where: {
            tierId: updateData.tierId,
            defaultRank: updateData.defaultRank,
            NOT: { id },
          },
        });

        if (existingMemetic) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              "A memetic with this rank and tier combination already exists",
          });
        }

        const updatedMemetic = await ctx.db.memetic.update({
          where: { id },
          data: {
            ...updateData,
            image: input.image,
          },
          include: { tier: true, tag: true },
        });

        await logActionHelper(
          ctx,
          "Update Memetic",
          "Memetic",
          id,
          "normal",
          updateData,
        );

        return updatedMemetic;
      } catch (error) {
        console.error("Error updating memetic:", error);
        if (error instanceof TRPCError) throw error;
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update memetic",
        });
      }
    }),

  deleteMemetic: editorProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        const deletedMemetic = await ctx.db.memetic.delete({
          where: { id: input },
        });

        await logActionHelper(ctx, "Delete Memetic", "Memetic", input, "high", {
          deletedMemeticId: input,
        });

        return deletedMemetic;
      } catch (error) {
        console.error("Error deleting memetic:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete memetic",
        });
      }
    }),

  getAllMemetics: protectedProcedure
    .input(
      z.object({
        search: z.string().optional(),
        tierFilter: z.string().optional(),
        tagFilter: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { search, tierFilter, tagFilter } = input;

      const whereConditions: any = {};

      if (search) {
        whereConditions.OR = [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ];
      }

      if (tierFilter) {
        whereConditions.tierId = tierFilter;
      }

      if (tagFilter) {
        whereConditions.tagId = tagFilter;
      }

      const memetics = await ctx.db.memetic.findMany({
        where: whereConditions,
        include: { tier: true, tag: true },
        orderBy: [{ tier: { order: "asc" } }, { defaultRank: "asc" }],
      });

      return memetics;
    }),

  // Player selects a memetic
  selectMemetic: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        memeticId: z.string(),
        playerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId },
        include: { players: true },
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      const isOwner = table.ownerId === user.id;
      const player = table.players.find((p) => p.id === input.playerId);

      if (!player) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Player not found" });
      }

      if (!isOwner && player.userId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to select memetics for this player",
        });
      }

      // Check if the player already has this memetic selected
      const existingSelection = await ctx.db.playerMemeticSelection.findUnique({
        where: {
          tablePlayerId_memeticId: {
            tablePlayerId: input.playerId,
            memeticId: input.memeticId,
          },
        },
      });

      if (existingSelection) {
        // If the selection exists, remove it (toggle behavior)
        await ctx.db.playerMemeticSelection.delete({
          where: { id: existingSelection.id },
        });
      } else {
        // If the selection doesn't exist, create it
        await ctx.db.playerMemeticSelection.create({
          data: {
            tablePlayer: { connect: { id: input.playerId } },
            memetic: { connect: { id: input.memeticId } },
          },
        });
      }

      await logActionHelper(
        ctx,
        "Toggle Memetic Selection",
        "PlayerMemeticSelection",
        `${input.playerId}-${input.memeticId}`,
        "normal",
        {
          tableId: input.tableId,
          memeticId: input.memeticId,
          playerId: input.playerId,
        },
      );

      return { success: true };
    }),

  removeMemetic: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        memeticId: z.string(),
        playerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId },
        include: {
          players: {
            include: { user: true },
          },
        },
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      const isOwner = table.ownerId === user.id;
      const player = table.players.find((p) => p.id === input.playerId);

      if (!player) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Player not found" });
      }

      if (!isOwner && player.userId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message:
            "Not authorized to remove memetic selections for this player",
        });
      }

      await ctx.db.playerMemeticSelection.deleteMany({
        where: {
          tablePlayerId: player.id,
          memeticId: input.memeticId,
        },
      });

      await logActionHelper(
        ctx,
        "Remove Memetic Selection",
        "PlayerMemeticSelection",
        `${player.id}-${input.memeticId}`,
        "normal",
        {
          tableId: input.tableId,
          memeticId: input.memeticId,
          playerId: input.playerId,
        },
      );

      return { success: true };
    }),
});

export default memeticRouter;
