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
    <Box className="relative min-h-screen">
      <AbstractBackground />
      <Box className="relative z-10" style={{ backgroundColor: 'transparent' }}>
        <GuestRecipeList
          search={search}
          filters={filters}
          onSearch={handleSearch}
          onFilterChange={handleFilterChange}
        />
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