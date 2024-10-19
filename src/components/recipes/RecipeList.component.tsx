'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { FlippingPages } from 'flipping-pages';
import 'flipping-pages/dist/style.css';
import RecipeCard from './RecipeCard.component';
import { api } from '@/trpc/react';
import { useDebounce } from '@/hooks/useDebounce';
import { flipbookConfig } from './flipbookConfig';
import RecipeSlider from './RecipeSlider.component';
import type { Filters } from '@/hooks/useRecipeSearchAndFilter';
import { Box, Text, Button, Flex } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface GuestRecipeListProps {
  search: string;
  filters: Filters;
  onSearch: (value: string) => void;
  onFilterChange: (filters: Filters) => void;
}

const GuestRecipeList: React.FC<GuestRecipeListProps> = ({
  search,
  filters,
  onSearch,
  onFilterChange,
}) => {
  const [selected, setSelected] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [disableSwipe, setDisableSwipe] = useState(false);
  const [isSliderInteracting, setIsSliderInteracting] = useState(false);
  const { theme } = useThemeContext();

  const debouncedSearch = useDebounce(search, 300);

  const recipesQuery = api.recipe.getAll.useInfiniteQuery(
    { limit: 1000, search: debouncedSearch, ...filters },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: Infinity,
    }
  );

  const bonusStatsQuery = api.bonusStat.getAllItems.useQuery(undefined, {
    staleTime: Infinity,
  });

  const toggleFoundMutation = api.recipe.toggleFound.useMutation({
    onSuccess: () => {
      void recipesQuery.refetch();
    },
  });

  const filteredRecipes = useMemo(
    () =>
      recipesQuery.data?.pages.flatMap((page) =>
        page.recipes.filter((recipe) => {
          const matchesType =
            filters.type === '' || recipe.type === filters.type;
          const matchesRarity =
            filters.rarity === '' || recipe.rarity === filters.rarity;
          const matchesFoundStatus =
            filters.foundStatus === '' ||
            (filters.foundStatus === 'found' && recipe.isFound) ||
            (filters.foundStatus === 'not_found' && !recipe.isFound);
          const matchesLocationType =
            filters.locationType === '' ||
            recipe.locationType === filters.locationType;
          return (
            matchesType &&
            matchesRarity &&
            matchesFoundStatus &&
            matchesLocationType
          );
        })
      ) ?? [],
    [recipesQuery.data, filters]
  );

  useEffect(() => {
    if (selected >= filteredRecipes.length) {
      setSelected(0);
    }
  }, [filteredRecipes, selected]);

  const nextPage = useCallback(
    () => setSelected((prev) => Math.min(prev + 1, filteredRecipes.length - 1)),
    [filteredRecipes]
  );
  const prevPage = useCallback(
    () => setSelected((prev) => Math.max(prev - 1, 0)),
    []
  );

  const handleSliderChange = useCallback((index: number) => {
    setSelected(index);
  }, []);

  const handleSliderInteractionStart = useCallback(() => {
    setIsSliderInteracting(true);
  }, []);

  const handleSliderInteractionEnd = useCallback(() => {
    setIsSliderInteracting(false);
  }, []);

  const currentFlipbookConfig = {
    ...flipbookConfig,
    animationDuration: isSliderInteracting
      ? 0
      : flipbookConfig.animationDuration,
  };

  useEffect(() => {
    if (recipesQuery.hasNextPage) {
      void recipesQuery.fetchNextPage();
    }
  }, [recipesQuery.hasNextPage]);

  if (recipesQuery.isLoading || bonusStatsQuery.isLoading)
    return <Text>Loading...</Text>;
  if (recipesQuery.isError)
    return <Text>Error: {recipesQuery.error.message}</Text>;
  if (bonusStatsQuery.isError)
    return (
      <Text>Error loading bonus stats: {bonusStatsQuery.error.message}</Text>
    );

  return (
    <Box
      className="relative flex min-h-screen flex-col"
      style={{ backgroundColor: 'transparent', color: 'var(--color-text)' }}
    >
      <Box
        className="flex flex-grow flex-col items-center justify-center"
        style={{ zIndex: 1 }}
      >
        <Box className="relative" style={{ width: '400px', height: '600px' }}>
          {filteredRecipes.length > 0 ? (
            <>
              <FlippingPages
                {...currentFlipbookConfig}
                selected={selected}
                disableSwipe={disableSwipe}
                onSwipeEnd={setSelected}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationEnd={() => setIsAnimating(false)}
              >
                {filteredRecipes.map((recipe) => (
                  <Box
                    key={recipe.id}
                    className="flex h-full items-center justify-center"
                  >
                    <RecipeCard
                      recipe={recipe}
                      onToggleFound={() =>
                        toggleFoundMutation.mutate(recipe.id)
                      }
                      bonusStats={bonusStatsQuery.data ?? []}
                      disableSwipe={setDisableSwipe}
                    />
                  </Box>
                ))}
              </FlippingPages>
              <Button
                onClick={prevPage}
                disabled={isAnimating || selected === 0}
                className="absolute left-[-40px] top-1/2 -translate-y-1/2 transform rounded-full p-3"
                style={{
                  backgroundColor: `var(--${theme.accentColor}-9)`,
                  color: 'white',
                  opacity: selected === 0 ? 0.5 : 1,
                  transition: 'opacity 0.3s ease, filter 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (selected !== 0) {
                    e.currentTarget.style.filter = 'brightness(120%)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(100%)';
                }}
              >
                &lt;
              </Button>
              <Button
                onClick={nextPage}
                disabled={
                  isAnimating || selected === filteredRecipes.length - 1
                }
                className="absolute right-[-40px] top-1/2 -translate-y-1/2 transform rounded-full p-3"
                style={{
                  backgroundColor: `var(--${theme.accentColor}-9)`,
                  color: 'white',
                  opacity: selected === filteredRecipes.length - 1 ? 0.5 : 1,
                  transition: 'opacity 0.3s ease, filter 0.3s ease',
                }}
                onMouseEnter={(e) => {
                  if (selected !== filteredRecipes.length - 1) {
                    e.currentTarget.style.filter = 'brightness(120%)';
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.filter = 'brightness(100%)';
                }}
              >
                &gt;
              </Button>
            </>
          ) : (
            <Text size="4" className="text-center">
              Nothing found
            </Text>
          )}
        </Box>
        <Box className="mb-12 mt-8 w-full max-w-[400px]">
          <RecipeSlider
            totalRecipes={filteredRecipes.length}
            currentIndex={selected}
            onIndexChange={handleSliderChange}
            onSliderInteractionStart={handleSliderInteractionStart}
            onSliderInteractionEnd={handleSliderInteractionEnd}
          />
        </Box>
      </Box>
      <Box
        className="sticky bottom-0 py-4 shadow-lg"
        style={{ backgroundColor: 'var(--color-background)' }}
      ></Box>
    </Box>
  );
};

export default React.memo(GuestRecipeList);
