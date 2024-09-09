import React, { useCallback } from 'react';

interface RecipeFiltersProps {
  filters: {
    type: string;
    rarity: string;
    foundStatus: string;
  };
  onFilterChange: (filters: RecipeFiltersProps['filters']) => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = React.memo(({ filters, onFilterChange }) => {
  const handleTypeChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, type: e.target.value });
  }, [filters, onFilterChange]);

  const handleRarityChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, rarity: e.target.value });
  }, [filters, onFilterChange]);

  const handleFoundStatusChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({ ...filters, foundStatus: e.target.value });
  }, [filters, onFilterChange]);

  return (
    <>
      <select
        value={filters.type}
        onChange={handleTypeChange}
        className="p-2 border rounded text-black"
      >
        <option value="">All Types</option>
        <option value="Food">Food</option>
        <option value="Drink">Drink</option>
        <option value="Crafted Ingredient">Crafted Ingredient</option>
      </select>
      <select
        value={filters.rarity}
        onChange={handleRarityChange}
        className="p-2 border rounded text-black"
      >
        <option value="">All Rarities</option>
        <option value="common">Common</option>
        <option value="uncommon">Uncommon</option>
        <option value="rare">Rare</option>
        <option value="unique">Unique</option>
      </select>
      {/* New dropdown for filtering found status */}
      <select
        value={filters.foundStatus}
        onChange={handleFoundStatusChange}
        className="p-2 border rounded text-black"
      >
        <option value="">All Finds</option>
        <option value="found">Found</option>
        <option value="not_found">Not Found</option>
      </select>
    </>
  );
});

RecipeFilters.displayName = 'RecipeFilters';

export default RecipeFilters;
