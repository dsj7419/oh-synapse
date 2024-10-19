'use client';

import React from 'react';
import { api } from '@/trpc/react';
import { Box, Text, Heading, Card, Flex, ScrollArea } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

const StatsDisplay = () => {
  const { theme } = useThemeContext();
  const {
    data: stats,
    isLoading,
    error,
  } = api.stats.getStats.useQuery(undefined, {
    refetchInterval: 60000, // Refetch every minute
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading stats: {error.message}</div>;

  if (!stats) {
    return <div>No stats available</div>;
  }

  // Styling enhancements
  const cardStyle = {
    backgroundColor: `var(--${theme.accentColor}-3)`,
    borderRadius: '12px',
    padding: '20px',
    marginBottom: '12px',
    boxShadow: '0 2px 10px var(--gray-5)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 15px var(--gray-7)',
    },
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '16px',
  };

  const sectionHeaderStyle = {
    borderBottom: `2px solid var(--${theme.accentColor}-6)`,
    marginBottom: '12px',
    paddingBottom: '4px',
  };

  const statTextStyle = {
    fontSize: '18px',
    color: `var(--${theme.accentColor}-12)`,
  };

  const statValueStyle = {
    fontSize: '22px',
    fontWeight: 'bold',
    color: `var(--${theme.accentColor}-11)`,
    marginLeft: '8px',
  };

  return (
    <ScrollArea type="auto" style={{ padding: '32px' }}>
      <Box p="4">
        <Flex justify="center" mb="6">
          <Heading size="7" style={{ color: `var(--${theme.accentColor}-11)` }}>
            Platform Statistics
          </Heading>
        </Flex>

        {/* Stats Section */}
        <Flex wrap="wrap" justify="center" gap="6">
          {/* Total Users */}
          <Card style={cardStyle}>
            <Text style={statTextStyle}>Total Users</Text>
            <Text style={statValueStyle}>{stats.totalUsers ?? 'N/A'}</Text>
          </Card>

          {/* Active Users */}
          <Card style={cardStyle}>
            <Text style={statTextStyle}>Active Users (Last 24 Hours)</Text>
            <Text style={statValueStyle}>
              {stats.activeUsersLast24Hours ?? 'N/A'}
            </Text>
          </Card>

          {/* New Users */}
          <Card style={cardStyle}>
            <Text style={statTextStyle}>New Users (Last 24 Hours)</Text>
            <Text style={statValueStyle}>
              {stats.newUsersLast24Hours ?? 'N/A'}
            </Text>
          </Card>

          {/* Total Recipes */}
          <Card style={cardStyle}>
            <Text style={statTextStyle}>Total Recipes</Text>
            <Text style={statValueStyle}>{stats.totalRecipes ?? 'N/A'}</Text>
          </Card>

          {/* Found Recipes */}
          <Card style={cardStyle}>
            <Text style={statTextStyle}>Total Found Recipes</Text>
            <Text style={statValueStyle}>
              {stats.totalFoundRecipes ?? 'N/A'}
            </Text>
          </Card>

          {/* Other Stats */}
          <Card style={cardStyle}>
            <Text style={statTextStyle}>Total Tables</Text>
            <Text style={statValueStyle}>{stats.totalTables ?? 'N/A'}</Text>
          </Card>

          <Card style={cardStyle}>
            <Text style={statTextStyle}>Total Memetics</Text>
            <Text style={statValueStyle}>{stats.totalMemetics ?? 'N/A'}</Text>
          </Card>

          <Card style={cardStyle}>
            <Text style={statTextStyle}>Total Invited Players</Text>
            <Text style={statValueStyle}>
              {stats.totalInvitedPlayers ?? 'N/A'}
            </Text>
          </Card>

          <Card style={cardStyle}>
            <Text style={statTextStyle}>Total Manual Players</Text>
            <Text style={statValueStyle}>
              {stats.totalManualPlayers ?? 'N/A'}
            </Text>
          </Card>

          <Card style={cardStyle}>
            <Text style={statTextStyle}>Invited Players Percentage</Text>
            <Text style={statValueStyle}>
              {stats.invitedPlayersPercentage?.toFixed(2) ?? 'N/A'}%
            </Text>
          </Card>

          <Card style={cardStyle}>
            <Text style={statTextStyle}>Total Audit Logs</Text>
            <Text style={statValueStyle}>{stats.totalAuditLogs ?? 'N/A'}</Text>
          </Card>
        </Flex>

        {/* Top Found Recipes Section */}
        <Heading size="5" mt="6" style={sectionHeaderStyle}>
          Top 5 Found Recipes
        </Heading>
        <Flex direction="column" gap="3">
          {stats.topFoundRecipes.length > 0 ? (
            stats.topFoundRecipes.map((recipe) => (
              <Card key={recipe.name} style={cardStyle}>
                <Text size="4" weight="bold">
                  {recipe.name}
                </Text>
                <Text size="3">Found {recipe.foundCount} times</Text>
              </Card>
            ))
          ) : (
            <Text size="3">No found recipes available.</Text>
          )}
        </Flex>

        {/* Recently Found Recipes */}
        <Heading size="5" mt="6" style={sectionHeaderStyle}>
          Recently Found Recipes
        </Heading>
        <Flex direction="column" gap="3">
          {stats.recentFoundRecipes.length > 0 ? (
            stats.recentFoundRecipes.map(({ recipe, user }) => (
              <Card key={recipe.id} style={cardStyle}>
                <Text size="4" weight="bold">
                  {recipe.name}
                </Text>
                <Text size="3">Found by {user.name}</Text>
              </Card>
            ))
          ) : (
            <Text size="3">No recent found recipes.</Text>
          )}
        </Flex>

        {/* Popular Memetics */}
        <Heading size="5" mt="6" style={sectionHeaderStyle}>
          Top 5 Popular Memetics
        </Heading>
        <Flex direction="column" gap="3">
          {stats.popularMemetics.length > 0 ? (
            stats.popularMemetics.map((memetic) => (
              <Card key={memetic.id} style={cardStyle}>
                <Text size="4" weight="bold">
                  {memetic.title}
                </Text>
                <Text size="3">
                  Selected {memetic._count.playerSelections} times
                </Text>
              </Card>
            ))
          ) : (
            <Text size="3">No popular memetics found.</Text>
          )}
        </Flex>
      </Box>
    </ScrollArea>
  );
};

export default StatsDisplay;
