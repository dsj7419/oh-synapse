"use client";

import React from 'react';
import GuestRecipeList from '@/components/recipes/RecipeList.component';
import RecipeSearchAndFilter from '@/components/recipes/RecipeSearchAndFilter.component';
import { useRecipeSearchAndFilter } from '@/hooks/useRecipeSearchAndFilter';

export default function RecipesPage() {
  const { search, filters, handleSearch, handleFilterChange } = useRecipeSearchAndFilter();

  return (
    <>
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
    </>
  );
}
