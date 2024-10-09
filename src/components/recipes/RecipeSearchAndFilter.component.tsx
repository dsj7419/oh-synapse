import React from 'react';
import { Box, Flex, Card } from '@radix-ui/themes';
import RecipeSearch from './RecipeSearch.component';
import RecipeFilters from './RecipeFilters.component';
import type { Filters } from '@/hooks/useRecipeSearchAndFilter';
import { useThemeContext } from '@/context/ThemeContext';

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
  const { theme } = useThemeContext();

  return (
    <Box
      position="fixed"
      bottom="0"
      left="0"
      right="0"
      style={{
        zIndex: 10,
        backgroundColor: 'var(--gray-12)',
        color: 'var(--gray-1)',
        boxShadow: 'var(--shadow-5)',
      }}
    >
      <Card size="3">
        <Flex direction="column" gap="4" align="center">
          <Box width="100%">
            <RecipeSearch search={search} onSearch={onSearch} />
          </Box>
          <Flex justify="center" align="center" gap="4" width="100%">
            <RecipeFilters filters={filters} onFilterChange={onFilterChange} />
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
};

export default RecipeSearchAndFilter;