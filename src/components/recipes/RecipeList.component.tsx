"use client";

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { FlippingPages } from 'flipping-pages';
import 'flipping-pages/dist/style.css';
import RecipeCard from './RecipeCard.component';
import { api } from "@/trpc/react";
import { useDebounce } from '@/hooks/useDebounce';
import { flipbookConfig } from './flipbookConfig';
import type { Filters } from '@/hooks/useRecipeSearchAndFilter';

interface GuestRecipeListProps {
  search: string;
  filters: Filters;
  onSearch: (value: string) => void;
  onFilterChange: (filters: Filters) => void;
}

const GuestRecipeList: React.FC<GuestRecipeListProps> = ({ search, filters }) => {
  const [selected, setSelected] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [disableSwipe, setDisableSwipe] = useState(false);

  const debouncedSearch = useDebounce(search, 300);

  const recipesQuery = api.recipe.getAll.useInfiniteQuery(
    { limit: 10, search: debouncedSearch, ...filters },
    { 
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      staleTime: Infinity,
    }
  );

  const bonusStatsQuery = api.bonusStat.getAllItems.useQuery(undefined, { staleTime: Infinity });

  const toggleFoundMutation = api.recipe.toggleFound.useMutation({
    onSuccess: () => {
      void recipesQuery.refetch();
    },
  });

  const filteredRecipes = useMemo(() => 
    recipesQuery.data?.pages.flatMap((page) =>
      page.recipes.filter((recipe) => {
        const matchesType = filters.type === "" || recipe.type === filters.type;
        const matchesRarity = filters.rarity === "" || recipe.rarity === filters.rarity;
        const matchesFoundStatus = filters.foundStatus === "" || 
          (filters.foundStatus === "found" && recipe.isFound) ||
          (filters.foundStatus === "not_found" && !recipe.isFound);
        return matchesType && matchesRarity && matchesFoundStatus;
      })
    ) ?? [],
    [recipesQuery.data, filters]
  );

 
  useEffect(() => {
    if (selected >= filteredRecipes.length) {
      setSelected(0);
    }
  }, [filteredRecipes, selected]);

  const nextPage = useCallback(() => setSelected((prev) => Math.min(prev + 1, filteredRecipes.length - 1)), [filteredRecipes]);
  const prevPage = useCallback(() => setSelected((prev) => Math.max(prev - 1, 0)), []);

  if (recipesQuery.isLoading || bonusStatsQuery.isLoading) return <div>Loading...</div>;
  if (recipesQuery.isError) return <div>Error: {recipesQuery.error.message}</div>;
  if (bonusStatsQuery.isError) return <div>Error loading bonus stats: {bonusStatsQuery.error.message}</div>;

  return (
    <div className="container mx-auto px-4 relative min-h-screen pb-20 flex flex-col justify-between">
      {/* Added padding to adjust the vertical position */}
      <div className="flex-grow flex justify-center items-center pt-0 pb-20">
        <div className="relative" style={{ width: '400px', height: '600px' }}>
          {filteredRecipes.length > 0 ? (
            <>
              <FlippingPages
                {...flipbookConfig}
                selected={selected}
                disableSwipe={disableSwipe} 
                onSwipeEnd={setSelected}
                onAnimationStart={() => setIsAnimating(true)}
                onAnimationEnd={() => setIsAnimating(false)}
              >
                {filteredRecipes.map((recipe) => (
                  <div key={recipe.id} className="flex justify-center items-center h-full">
                    <RecipeCard
                      recipe={recipe}
                      onToggleFound={() => toggleFoundMutation.mutate(recipe.id)}
                      bonusStats={bonusStatsQuery.data ?? []}
                      disableSwipe={setDisableSwipe} 
                    />
                  </div>
                ))}
              </FlippingPages>

              <button 
                onClick={prevPage} 
                className="absolute left-[-40px] top-1/2 transform -translate-y-1/2 bg-gray-500 text-white rounded-full p-3 hover:bg-gray-600"
                disabled={isAnimating || selected === 0}
              >
                ‹
              </button>
              <button 
                onClick={nextPage} 
                className="absolute right-[-40px] top-1/2 transform -translate-y-1/2 bg-blue-500 text-white rounded-full p-3 hover:bg-blue-600"
                disabled={isAnimating || selected === filteredRecipes.length - 1}
              >
                ›
              </button>
            </>
          ) : (
            <div className="text-center text-lg">Nothing Found</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(GuestRecipeList);
