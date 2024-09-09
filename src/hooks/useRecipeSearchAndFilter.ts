import { useState, useCallback } from 'react';

export interface Filters {
  type: string;
  rarity: string;
  foundStatus: string;
}

export function useRecipeSearchAndFilter() {
  const [search, setSearch] = useState<string>("");
  const [filters, setFilters] = useState<Filters>({
    type: "",
    rarity: "",
    foundStatus: "",
  });

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleFilterChange = useCallback((newFilters: Filters) => {
    setFilters(newFilters);
  }, []);

  return {
    search,
    filters,
    handleSearch,
    handleFilterChange,
  };
}
