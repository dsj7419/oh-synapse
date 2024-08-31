'use client';

import React, { useState } from 'react';
import { api } from "@/trpc/react";
import { useDebounce } from '@/hooks/useDebounce';
import RecipeCard from './RecipeCard.component';
import RecipeFilters from './RecipeFilters.component';
import RecipeSearch from './RecipeSearch.component';

const GuestRecipeList: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    type: "",
    rarity: "",
  });

  const debouncedSearch = useDebounce(search, 300);

  const recipesQuery = api.recipe.getAll.useInfiniteQuery(
    { limit: 10, search: debouncedSearch, ...filters },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
    }
  );

  const bonusStatsQuery = api.bonusStat.getAllItems.useQuery();

  const toggleFoundMutation = api.recipe.toggleFound.useMutation({
    onSuccess: () => {
      recipesQuery.refetch();
    },
  });

  const handleSearch = (value: string) => {
    setSearch(value);
  };

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const handleToggleFound = (recipeId: string) => {
    toggleFoundMutation.mutate(recipeId);
  };

  if (recipesQuery.isLoading || bonusStatsQuery.isLoading) return <div>Loading...</div>;
  if (recipesQuery.isError) return <div>Error: {recipesQuery.error.message}</div>;
  if (bonusStatsQuery.isError) return <div>Error loading bonus stats: {bonusStatsQuery.error.message}</div>;

  return (
    <div className="container mx-auto px-4">
      <div className="sticky top-0 bg-white z-10 py-4 shadow-md">
        <h1 className="text-3xl font-bold mb-6">Recipes</h1>
        <div className="mb-6">
          <RecipeSearch search={search} onSearch={handleSearch} />
          <RecipeFilters filters={filters} onFilterChange={handleFilterChange} />
        </div>
      </div>
      <div className="space-y-4 mt-4">
        {recipesQuery.data?.pages.flatMap((page) =>
          page.recipes.map((recipe) => (
            <RecipeCard
              key={recipe.id}
              recipe={recipe}
              onToggleFound={() => handleToggleFound(recipe.id)}
              bonusStats={bonusStatsQuery.data || []}
            />
          ))
        )}
      </div>
      {recipesQuery.hasNextPage && (
        <button
          onClick={() => recipesQuery.fetchNextPage()}
          disabled={recipesQuery.isFetchingNextPage}
          className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          {recipesQuery.isFetchingNextPage ? 'Loading more...' : 'Load More'}
        </button>
      )}
    </div>
  );
};

export default GuestRecipeList;