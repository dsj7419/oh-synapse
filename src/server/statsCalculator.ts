import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function calculateStats() {
  const [
    totalUsers,
    activeUsersLast24Hours,
    totalRecipes,
    totalTables,
    totalMemetics,
    totalFoundRecipes,
    totalInvitedPlayers,
    totalManualPlayers,
    newUsersLast24Hours,
    topFoundRecipes,
    recentFoundRecipes,
    popularMemetics,
    totalAuditLogs,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        updatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.recipe.count(),
    prisma.table.count(),
    prisma.memetic.count(),
    prisma.userRecipe.count(),
    prisma.tablePlayer.count({
      where: { userId: { not: null } },
    }),
    prisma.tablePlayer.count({
      where: { userId: null },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.recipe.findMany({
      orderBy: { foundCount: 'desc' },
      take: 5,
      select: { name: true, foundCount: true },
    }),
    prisma.userRecipe.findMany({
      orderBy: { foundAt: 'desc' },
      take: 5,
      include: {
        recipe: true,
        user: true,
      },
    }),
    prisma.memetic.findMany({
      orderBy: [{ playerSelections: { _count: 'desc' } }],
      take: 5,
      include: {
        _count: {
          select: { playerSelections: true },
        },
      },
    }),
    prisma.auditLog.count(),
  ]);

  const totalPlayers = totalInvitedPlayers + totalManualPlayers;
  const invitedPlayersPercentage =
    totalPlayers > 0 ? (totalInvitedPlayers / totalPlayers) * 100 : 0;

  return {
    totalUsers,
    activeUsersLast24Hours,
    newUsersLast24Hours,
    totalRecipes,
    totalTables,
    totalMemetics,
    totalFoundRecipes,
    totalInvitedPlayers,
    totalManualPlayers,
    invitedPlayersPercentage,
    topFoundRecipes,
    recentFoundRecipes,
    popularMemetics,
    totalAuditLogs,
  };
}
