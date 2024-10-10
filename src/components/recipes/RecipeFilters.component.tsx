import React, { useCallback } from 'react';
import { Select, Flex, Box } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface RecipeFiltersProps {
  filters: {
    type: string;
    rarity: string;
    foundStatus: string;
    locationType: string;
  };
  onFilterChange: (filters: RecipeFiltersProps['filters']) => void;
}

const RecipeFilters: React.FC<RecipeFiltersProps> = React.memo(({ filters, onFilterChange }) => {
  const { theme } = useThemeContext();

  const handleTypeChange = useCallback((value: string) => {
    onFilterChange({ ...filters, type: value });
  }, [filters, onFilterChange]);

  const handleRarityChange = useCallback((value: string) => {
    onFilterChange({ ...filters, rarity: value });
  }, [filters, onFilterChange]);

  const handleFoundStatusChange = useCallback((value: string) => {
    onFilterChange({ ...filters, foundStatus: value });
  }, [filters, onFilterChange]);

  const handleLocationTypeChange = useCallback((value: string) => {
    onFilterChange({ ...filters, locationType: value });
  }, [filters, onFilterChange]);

  return (
    <Flex direction={{ initial: 'column', sm: 'row' }} gap="4" wrap="wrap">
      <Box className="flex-1 min-w-[150px]">
        <Select.Root
          value={filters.type || "default"}
          onValueChange={(value) => handleTypeChange(value === "default" ? "" : value)}
        >
          <Select.Trigger
            placeholder="All Types"
            radius={theme.radius}
            variant="surface"
            className="w-full"
          />
          <Select.Content>
            <Select.Item value="default">All Types</Select.Item>
            <Select.Item value="Food">Food</Select.Item>
            <Select.Item value="Drink">Drink</Select.Item>
            <Select.Item value="Crafted Ingredient">Crafted Ingredient</Select.Item>
          </Select.Content>
        </Select.Root>
      </Box>
      
      <Box className="flex-1 min-w-[150px]">
        <Select.Root
          value={filters.rarity || "default"}
          onValueChange={(value) => handleRarityChange(value === "default" ? "" : value)}
        >
          <Select.Trigger
            placeholder="All Rarities"
            radius={theme.radius}
            variant="surface"
            className="w-full"
          />
          <Select.Content>
            <Select.Item value="default">All Rarities</Select.Item>
            <Select.Item value="common">Common</Select.Item>
            <Select.Item value="uncommon">Uncommon</Select.Item>
            <Select.Item value="rare">Rare</Select.Item>
            <Select.Item value="unique">Unique</Select.Item>
          </Select.Content>
        </Select.Root>
      </Box>
      
      <Box className="flex-1 min-w-[150px]">
        <Select.Root
          value={filters.foundStatus || "default"}
          onValueChange={(value) => handleFoundStatusChange(value === "default" ? "" : value)}
        >
          <Select.Trigger
            placeholder="All Finds"
            radius={theme.radius}
            variant="surface"
            className="w-full"
          />
          <Select.Content>
            <Select.Item value="default">All Finds</Select.Item>
            <Select.Item value="found">Found</Select.Item>
            <Select.Item value="not_found">Not Found</Select.Item>
          </Select.Content>
        </Select.Root>
      </Box>
      
      <Box className="flex-1 min-w-[150px]">
        <Select.Root
          value={filters.locationType || "default"}
          onValueChange={(value) => handleLocationTypeChange(value === "default" ? "" : value)}
        >
          <Select.Trigger
            placeholder="All Locations"
            radius={theme.radius}
            variant="surface"
            className="w-full"
          />
          <Select.Content>
            <Select.Item value="default">All Locations</Select.Item>
            <Select.Item value="memetics">Memetic</Select.Item>
            <Select.Item value="worldMap">World Location</Select.Item>
          </Select.Content>
        </Select.Root>
      </Box>
    </Flex>
  );
});

RecipeFilters.displayName = 'RecipeFilters';
export default RecipeFilters;