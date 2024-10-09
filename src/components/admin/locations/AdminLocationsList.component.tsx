"use client";

import React, { useState } from 'react';
import { api } from "@/trpc/react";
import { PencilIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { Box, Flex, Heading, TextField, Button, Text, Card } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface AdminLocationsListProps {
  onEdit: (recipeId: string) => void;
}

const AdminLocationsList: React.FC<AdminLocationsListProps> = ({ onEdit }) => {
  const [search, setSearch] = useState("");
  const [hasLocationFilter, setHasLocationFilter] = useState<boolean | undefined>(undefined);
  const { theme } = useThemeContext();

  const recipesQuery = api.location.getAllRecipesWithLocations.useInfiniteQuery(
    { limit: 10, search, hasLocation: hasLocationFilter },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      refetchInterval: 5000,
    }
  );

  const toggleHasLocationFilter = () => {
    setHasLocationFilter((prev) => {
      if (prev === undefined) return true;
      if (prev === true) return false;
      return undefined;
    });
  };

  const filteredRecipes = recipesQuery.data?.pages.flatMap((page) =>
    page.recipes.filter((recipe) => recipe.locationType !== 'memetics')
  );

  return (
    <Card size="3" style={{ backgroundColor: 'var(--color-surface)' }}>
      <Heading size="4" mb="4">Locations Management</Heading>
      <Flex direction="column" gap="4">
        <Flex gap="2">
          <TextField.Root
            size="3"
            variant="surface"
            radius={theme.radius}
            style={{ flex: 1 }}
            value={search}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value)}
            placeholder="Search recipes..."
          />
          <Button
            onClick={toggleHasLocationFilter}
            style={{
              backgroundColor: `var(--${theme.accentColor}-9)`,
              color: 'var(--color-background)',
              borderRadius: `var(--radius-${theme.radius})`,
            }}
          >
            {hasLocationFilter === undefined
              ? 'All'
              : hasLocationFilter
              ? 'Has Location'
              : 'No Location'}
          </Button>
        </Flex>
  
        {recipesQuery.isLoading ? (
          <Text>Loading...</Text>
        ) : recipesQuery.isError ? (
          <Text color="red">{recipesQuery.error.message}</Text>
        ) : (
          <>
            <Box px="4">
              {filteredRecipes?.map((recipe) => (
                <Box
                  key={recipe.id}
                  mb="2"
                  style={{
                    backgroundColor: `var(--${theme.accentColor}-3)`,
                    color: `var(--${theme.accentColor}-12)`,
                    borderRadius: `var(--radius-${theme.radius})`,
                    padding: '8px 16px',
                  }}
                >
                  <Flex justify="between" align="center">
                    <Flex align="center" gap="2">
                      {recipe.location && recipe.isComplete && (
                        <CheckCircleIcon className="h-5 w-5 text-green-500" />
                      )}
                      <Text>
                        {recipe.name} - {recipe.type} -{' '}
                        {recipe.location ? 'Location Assigned' : 'No Location'}
                      </Text>
                    </Flex>
                    <Button
                      onClick={() => onEdit(recipe.id)}
                      style={{
                        backgroundColor: 'transparent',
                        color: `var(--${theme.accentColor}-9)`,
                        transition: 'color 0.2s ease',
                      }}
                    >
                      <PencilIcon className="h-5 w-5 hover:scale-110 transform transition-all" />
                    </Button>
                  </Flex>
                </Box>
              ))}
            </Box>
            {recipesQuery.hasNextPage && (
              <Button
                onClick={() => recipesQuery.fetchNextPage()}
                disabled={recipesQuery.isFetchingNextPage}
                style={{
                  backgroundColor: `var(--${theme.accentColor}-9)`,
                  color: 'var(--color-background)',
                  borderRadius: `var(--radius-${theme.radius})`,
                }}
              >
                {recipesQuery.isFetchingNextPage ? 'Loading more...' : 'Load More'}
              </Button>
            )}
          </>
        )}
      </Flex>
    </Card>
  );
};

export default AdminLocationsList;