import React from 'react';
import { Select, TextField, Grid, Flex } from '@radix-ui/themes';
import type { RecipeDetails, Category } from '@/types/recipe';
import { useThemeContext } from '@/context/ThemeContext';

interface RecipeIngredientsProps {
  recipe: RecipeDetails;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  categories: Category[];
}

export const RecipeIngredients: React.FC<RecipeIngredientsProps> = ({ recipe, handleInputChange, categories }) => {
  const { theme } = useThemeContext();

  const handleOptionalIngredientChange = (value: string) => {
    handleInputChange({ 
      target: { 
        name: 'optionalIngredient', 
        value: value === "default" ? "" : value 
      } 
    } as any);
  };

  return (
    <Flex direction="column" gap="3">
      <Select.Root
        value={recipe.optionalIngredient ?? 'default'}
        onValueChange={handleOptionalIngredientChange}
      >
        <Select.Trigger 
          placeholder="Optional Ingredient" 
          radius={theme.radius}
          variant="surface"
        />
        <Select.Content>
          <Select.Item value="default">None</Select.Item>
          {categories.map((category) => (
            <Select.Item key={category.id} value={category.id}>
              {category.name}
            </Select.Item>
          ))}
        </Select.Content>
      </Select.Root>

      <Grid columns="2" gap="3">
        {['ingredient1', 'ingredient2', 'ingredient3', 'ingredient4'].map((ingredientName, index) => (
          <TextField.Root
            key={ingredientName}
            value={recipe[ingredientName as keyof RecipeDetails] as string ?? ''}
            onChange={handleInputChange}
            placeholder={`Ingredient ${index + 1}`}
            name={ingredientName}
            required={index === 0}
          />
        ))}
      </Grid>
    </Flex>
  );
};