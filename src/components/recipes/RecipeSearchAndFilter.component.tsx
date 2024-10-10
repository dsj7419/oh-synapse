"use client";

import React, { useState } from 'react';
import { Box, Flex, Card, Button } from '@radix-ui/themes';
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
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);

  return (
    <Box
      style={{
        backgroundColor: 'var(--gray-12)',
        color: 'var(--gray-1)',
        boxShadow: 'var(--shadow-5)',
      }}
    >
      <Card size="3">
        <Flex direction="column" gap="4" align="stretch">
          <Box width="100%">
            <RecipeSearch search={search} onSearch={onSearch} />
          </Box>
          <Flex justify="center" align="center" gap="4" width="100%">
            <Button 
              onClick={() => setIsFilterExpanded(!isFilterExpanded)}
              variant="soft"
              color={theme.accentColor}
            >
              {isFilterExpanded ? 'Hide Filters' : 'Show Filters'}
            </Button>
          </Flex>
          {isFilterExpanded && (
            <Box>
              <RecipeFilters filters={filters} onFilterChange={onFilterChange} />
            </Box>
          )}
        </Flex>
      </Card>
    </Box>
  );
};

export default RecipeSearchAndFilter;