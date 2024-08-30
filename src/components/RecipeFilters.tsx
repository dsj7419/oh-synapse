import React from 'react';

interface RecipeFiltersProps {
  filters: {
    type: string;
    rarity: string;
  };
  onFilterChange: (filters: RecipeFiltersProps['filters']) => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = ({ filters, onFilterChange }) => {
  return (
    <div className="flex space-x-4">
      <select
        value={filters.type}
        onChange={(e) => onFilterChange({ ...filters, type: e.target.value })}
        className="p-2 border rounded"
      >
        <option value="">All Types</option>
        <option value="Food">Food</option>
        <option value="Drink">Drink</option>
        <option value="Crafted Ingredient">Crafted Ingredient</option>
      </select>
      <select
        value={filters.rarity}
        onChange={(e) => onFilterChange({ ...filters, rarity: e.target.value })}
        className="p-2 border rounded"
      >
        <option value="">All Rarities</option>
        <option value="common">Common</option>
        <option value="uncommon">Uncommon</option>
        <option value="rare">Rare</option>
        <option value="unique">Unique</option>
      </select>
    </div>
  );
};

export default RecipeFilters;