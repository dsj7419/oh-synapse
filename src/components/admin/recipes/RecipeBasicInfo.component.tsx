import React from 'react';
import { TextField, Select, Flex, Box } from '@radix-ui/themes';
import type { RecipeDetails } from '@/types/recipe';
import { useThemeContext } from '@/context/ThemeContext';

interface RecipeBasicInfoProps {
  recipe: RecipeDetails;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
}

export const RecipeBasicInfo: React.FC<RecipeBasicInfoProps> = ({
  recipe,
  handleInputChange,
}) => {
  const { theme } = useThemeContext();

  return (
    <Flex direction="column" gap="3">
      <TextField.Root
        value={recipe.name}
        onChange={handleInputChange}
        placeholder="Recipe Name"
        name="name"
        required
      />

      <Select.Root
        name="type"
        value={recipe.type}
        onValueChange={(value) =>
          handleInputChange({ target: { name: 'type', value } } as any)
        }
      >
        <Select.Trigger placeholder="Select Type" />
        <Select.Content>
          <Select.Item value="Food">Food</Select.Item>
          <Select.Item value="Drink">Drink</Select.Item>
          <Select.Item value="Crafted Ingredient">
            Crafted Ingredient
          </Select.Item>
          <Select.Item value="Found Ingredient">Found Ingredient</Select.Item>
        </Select.Content>
      </Select.Root>

      <Box>
        <TextField.Root
          value={recipe.description}
          onChange={handleInputChange}
          placeholder="Description"
          name="description"
          style={{ minHeight: '100px' }}
        />
      </Box>
    </Flex>
  );
};
