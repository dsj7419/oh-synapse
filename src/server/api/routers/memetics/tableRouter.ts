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

export const tableRouter = createTRPCRouter({
  // Memetic Table Management
  getAllTables: protectedProcedure
    .input(
      z.object({
        page: z.number().min(1).default(1),
        perPage: z.number().min(1).max(100).default(20),
        search: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, perPage, search } = input;
      const skip = (page - 1) * perPage;

      const whereClause = search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              {
                owner: {
                  name: { contains: search, mode: "insensitive" as const },
                },
              },
            ],
          }
        : {};

      const [tables, totalCount] = await Promise.all([
        ctx.db.table.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          include: { owner: true, template: true },
          skip,
          take: perPage,
        }),
        ctx.db.table.count({ where: whereClause }),
      ]);

      return {
        tables,
        totalPages: Math.ceil(totalCount / perPage),
        currentPage: page,
      };
    }),

  createTable: editorProcedure
    .input(
      z.object({
        name: z.string(),
        templateId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);
      const newTable = await ctx.db.table.create({
        data: {
          name: input.name,
          owner: { connect: { id: user.id } },
          template: { connect: { id: input.templateId } },
        },
      });

      await logServerAction({
        userId: user.id,
        username: user.name ?? "Unknown",
        userRole: user.roles.join(", "),
        action: "Create Memetic Table",
        resourceType: "Table",
        resourceId: newTable.id,
        severity: "normal",
        details: input,
      });

      return newTable;
    }),

  // Update Table Order
  updateTableOrder: protectedProcedure
    .input(z.object({ tableIds: z.array(z.string()) }))
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      const tables = await ctx.db.table.findMany({
        where: { ownerId: user.id },
        select: { id: true },
      });

      const ownedTableIds = tables.map((table) => table.id);

      // Ensure the input tableIds are owned by the user
      const isValid = input.tableIds.every((id) => ownedTableIds.includes(id));

      if (!isValid) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Invalid table IDs",
        });
      }

      try {
        await ctx.db.$transaction(
          input.tableIds.map((id, index) =>
            ctx.db.table.update({
              where: { id },
              data: { order: index },
            }),
          ),
        );
        await logActionHelper(
          ctx,
          "Update Memetic Table Order",
          "Table",
          input.tableIds.join(","),
          "low",
          { newOrder: input.tableIds },
        );
        return { success: true };
      } catch (error) {
        console.error("Error updating memetic table order:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update memetic table order",
        });
      }
    }),

  deleteTable: editorProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      try {
        const deletedTable = await ctx.db.table.delete({
          where: { id: input },
        });
        await logActionHelper(
          ctx,
          "Delete Memetic Table",
          "Table",
          input,
          "high",
          { deletedTableId: input },
        );
        return deletedTable;
      } catch (error) {
        console.error("Error deleting memetic table:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete memetic table",
        });
      }
    }),

  // Fetch tables owned by the user
  getUserTables: protectedProcedure.query(async ({ ctx }) => {
    const user = ensureAuth(ctx);
    const tables = await ctx.db.table.findMany({
      where: { ownerId: user.id },
      include: { template: true },
      orderBy: { order: "asc" },
    });
    return tables;
  }),

  // User creates a new memetic table
  createUserTable: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        templateId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);
      const newOrder = await ctx.db.table.count({
        where: { ownerId: user.id },
      });
      const newTable = await ctx.db.table.create({
        data: {
          name: input.name,
          owner: { connect: { id: user.id } },
          template: { connect: { id: input.templateId } },
          order: newOrder,
        },
      });

      await logActionHelper(
        ctx,
        "Create Memetic Table",
        "Table",
        newTable.id,
        "normal",
        input,
      );

      return newTable;
    }),

  // Get a specific table with its memetics and player selections
  getTableById: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);
      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId },
        include: {
          owner: true,
          template: {
            include: {
              assignments: {
                include: {
                  memetic: {
                    include: {
                      tier: true,
                      tag: true,
                    },
                  },
                },
              },
            },
          },
          players: {
            include: {
              user: true,
              selections: {
                include: {
                  memetic: {
                    include: {
                      tier: true,
                      tag: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      const isOwner = table.ownerId === user.id;
      const isPlayer = table.players.some((p) => p.userId === user.id);

      if (!isOwner && !isPlayer) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to view this table",
        });
      }

      return table;
    }),

  // Archive Table
  archiveTable: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      const table = await ctx.db.table.findUnique({
        where: { id: input },
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      if (table.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can archive the table",
        });
      }

      await ctx.db.table.update({
        where: { id: input },
        data: { isArchived: true },
      });

      await logActionHelper(
        ctx,
        "Archive Memetic Table",
        "Table",
        input,
        "normal",
        {
          archivedTableId: input,
        },
      );

      return { success: true };
    }),

  // Unarchive Table
  unarchiveTable: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      const table = await ctx.db.table.findUnique({
        where: { id: input },
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      if (table.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can unarchive the table",
        });
      }

      await ctx.db.table.update({
        where: { id: input },
        data: { isArchived: false },
      });

      await logActionHelper(
        ctx,
        "Unarchive Memetic Table",
        "Table",
        input,
        "normal",
        {
          unarchivedTableId: input,
        },
      );

      return { success: true };
    }),

  // User leaves a table they are part of
  leaveTable: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      const tablePlayer = await ctx.db.tablePlayer.findUnique({
        where: {
          tableId_userId: {
            tableId: input,
            userId: user.id,
          },
        },
      });

      if (!tablePlayer) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "You are not part of this table",
        });
      }

      await ctx.db.tablePlayer.delete({
        where: { id: tablePlayer.id },
      });

      await logActionHelper(
        ctx,
        "Leave Table",
        "TablePlayer",
        tablePlayer.id,
        "normal",
        { tableId: input, userId: user.id },
      );

      return { success: true };
    }),

  // Generate Public Link
  generatePublicLink: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      const table = await ctx.db.table.findUnique({
        where: { id: input },
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      if (table.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can generate a public link",
        });
      }

      const newLink = `${table.id}-${Date.now()}`;

      const updatedTable = await ctx.db.table.update({
        where: { id: input },
        data: { publicLink: newLink },
      });

      await logActionHelper(
        ctx,
        "Generate Public Link",
        "Table",
        input,
        "normal",
        {
          publicLink: newLink,
        },
      );

      return { publicLink: newLink };
    }),

  // Get Table by Public Link
  getTableByPublicLink: publicProcedure
    .input(z.string())
    .query(async ({ ctx, input }) => {
      console.log("Fetching table with public link:", input);
      const table = await ctx.db.table.findFirst({
        where: { publicLink: input },
        include: {
          owner: true,
          template: {
            include: {
              assignments: {
                include: {
                  memetic: {
                    include: {
                      tier: true,
                      tag: true,
                    },
                  },
                },
              },
            },
          },
          players: {
            include: {
              user: true,
              selections: {
                include: {
                  memetic: {
                    include: {
                      tier: true,
                      tag: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!table) {
        console.log("Table not found for public link:", input);
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      console.log("Table found:", table.id);
      return table;
    }),

  // Get tables the user is a player in
  getPlayerTables: protectedProcedure.query(async ({ ctx }) => {
    const user = ensureAuth(ctx);
    const tables = await ctx.db.tablePlayer.findMany({
      where: { userId: user.id },
      include: {
        table: {
          include: { owner: true, template: true },
        },
      },
    });
    return tables.map((tp) => tp.table);
  }),

  // Invite a player to the table
  invitePlayer: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        invitee: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId },
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      if (table.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can invite players",
        });
      }

      let inviteeUser;

      if (input.invitee.toLowerCase() === "me") {
        inviteeUser = user;
      } else {
        inviteeUser = await ctx.db.user.findFirst({
          where: {
            OR: [
              { email: { equals: input.invitee, mode: "insensitive" } },
              { name: { equals: input.invitee, mode: "insensitive" } },
            ],
          },
        });
      }

      let existingPlayer;

      if (inviteeUser) {
        // User exists, check if they are already a player
        existingPlayer = await ctx.db.tablePlayer.findFirst({
          where: {
            tableId: input.tableId,
            userId: inviteeUser.id,
          },
        });

        if (existingPlayer) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Player is already added to the table",
          });
        }
      } else {
        // Guest player, check by name
        existingPlayer = await ctx.db.tablePlayer.findFirst({
          where: {
            tableId: input.tableId,
            name: input.invitee,
          },
        });

        if (existingPlayer) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Player is already added to the table",
          });
        }
      }

      // Create the player
      const newPlayer = await ctx.db.tablePlayer.create({
        data: {
          tableId: input.tableId,
          userId: inviteeUser?.id,
          name: inviteeUser ? undefined : input.invitee,
          canSelfManage: inviteeUser ? true : false,
        },
        include: {
          user: true,
        },
      });

      await logActionHelper(
        ctx,
        "Invite Player",
        "TablePlayer",
        newPlayer.id,
        "normal",
        {
          tableId: input.tableId,
          userId: inviteeUser?.id,
          name: newPlayer.name,
        },
      );

      return newPlayer;
    }),

  kickPlayer: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        playerId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId },
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      if (table.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can kick players",
        });
      }

      // Delete the player and their selections
      await ctx.db.$transaction(async (prisma) => {
        await prisma.playerMemeticSelection.deleteMany({
          where: { tablePlayerId: input.playerId },
        });

        await prisma.tablePlayer.delete({
          where: { id: input.playerId },
        });
      });

      await logActionHelper(
        ctx,
        "Kick Player",
        "TablePlayer",
        input.playerId,
        "normal",
        {
          tableId: input.tableId,
          kickedPlayerId: input.playerId,
        },
      );

      return { success: true };
    }),

  // Get players associated with a table
  getTablePlayers: protectedProcedure
    .input(z.object({ tableId: z.string() }))
    .query(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      const table = await ctx.db.table.findUnique({
        where: { id: input.tableId },
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      const isOwner = table.ownerId === user.id;

      if (!isOwner) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Not authorized to view this table's players",
        });
      }

      const players = await ctx.db.tablePlayer.findMany({
        where: { tableId: input.tableId },
        include: { user: true },
      });

      return players;
    }),

  // User deletes their own table
  deleteUserTable: protectedProcedure
    .input(z.string())
    .mutation(async ({ ctx, input }) => {
      const user = ensureAuth(ctx);

      // Check if the user is the owner of the table
      const table = await ctx.db.table.findUnique({
        where: { id: input },
      });

      if (!table) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Table not found" });
      }

      if (table.ownerId !== user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Only the owner can delete the table",
        });
      }

      // Delete the table and associated data
      await ctx.db.$transaction(async (prisma) => {
        // Delete PlayerMemeticSelections
        await prisma.playerMemeticSelection.deleteMany({
          where: {
            tablePlayer: {
              tableId: input,
            },
          },
        });

        // Delete TablePlayers
        await prisma.tablePlayer.deleteMany({
          where: { tableId: input },
        });

        // Delete the table
        await prisma.table.delete({
          where: { id: input },
        });
      });

      await logActionHelper(
        ctx,
        "Delete Memetic Table",
        "Table",
        input,
        "normal",
        { deletedTableId: input },
      );

      return { success: true };
    }),
});

export default tableRouter;
