import React, { useCallback } from 'react';
import { TextField, Button, Flex } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface RecipeSearchProps {
  search: string;
  onSearch: (value: string) => void;
}

const RecipeSearch: React.FC<RecipeSearchProps> = ({ search, onSearch }) => {
  const { theme } = useThemeContext();

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  }, [onSearch]);

  const handleClear = useCallback(() => {
    onSearch('');
  }, [onSearch]);

  return (
    <Flex width="100%" align="center" gap="2">
      <TextField.Root
        size="3"
        variant="surface"
        radius={theme.radius}
        style={{ flex: 1 }}
        value={search}
        onChange={handleChange}
        placeholder="Search recipes..."
      />
      {search && (
        <Button
          onClick={handleClear}
          size="3"
          variant="soft"
          color={theme.accentColor}
          radius={theme.radius}
        >
          Clear
        </Button>
      )}
    </Flex>
  );
};

export default React.memo(RecipeSearch);