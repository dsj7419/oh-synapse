import React from 'react';
import RecipeSearch from './RecipeSearch.component';
import RecipeFilters from './RecipeFilters.component';
import type { Filters } from '@/hooks/useRecipeSearchAndFilter';

interface RecipeSearchAndFilterProps {
  search: string;
  filters: Filters;
  onSearch: (value: string) => void;
  onFilterChange: (filters: Filters) => void;
}

const RecipeSearchAndFilter: React.FC<RecipeSearchAndFilterProps> = ({
  search,
  filters,
  onSearch,
  onFilterChange,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 py-4 shadow-md bg-gray-800 text-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="flex w-full items-center gap-2">
            <RecipeSearch search={search} onSearch={onSearch} />
          </div>
          <div className="flex justify-center items-center gap-4 w-full">
            <RecipeFilters filters={filters} onFilterChange={onFilterChange} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecipeSearchAndFilter;
