"use client";

import React from 'react';
import GuestRecipeList from '@/components/recipes/RecipeList.component';
import RecipeSearchAndFilter from '@/components/recipes/RecipeSearchAndFilter.component';
import { useRecipeSearchAndFilter } from '@/hooks/useRecipeSearchAndFilter';
import AbstractBackground from '@/components/background/AbstractBackground';
import { Box } from '@radix-ui/themes';

export default function RecipesPage() {
  const { search, filters, handleSearch, handleFilterChange } = useRecipeSearchAndFilter();

  return (
    <Box className="fixed inset-0 flex flex-col" style={{ height: '100vh', overflow: 'hidden' }}>
      <AbstractBackground />
      <Box className="flex-grow relative">
        <GuestRecipeList
          search={search}
          filters={filters}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
      </Box>
      <Box className="absolute bottom-0 left-0 right-0 z-20 bg-opacity-90 backdrop-blur-sm bg-gray-900">
        <RecipeSearchAndFilter
          search={search}
          filters={filters}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
      </Box>
    </Box>
  );
}