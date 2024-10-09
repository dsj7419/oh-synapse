'use client';

import React from 'react';
import { api } from "@/trpc/react";
import { Card, Flex, Text, Heading, Button } from '@radix-ui/themes';
import { useThemeContext } from '@/context/ThemeContext';

interface RecipeDetailProps {
  recipeId: string;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipeId }) => {
  const recipeQuery = api.recipe.getById.useQuery(recipeId);
  const markAsFoundMutation = api.recipe.markAsFound.useMutation();
  const { theme } = useThemeContext();

  if (recipeQuery.isLoading) return <Text>Loading...</Text>;
  if (recipeQuery.isError) return <Text color="red">{recipeQuery.error.message}</Text>;
  if (!recipeQuery.data) return <Text>Recipe not found</Text>;

  const recipe = recipeQuery.data;

  return (
    <Card size="3">
      <Flex direction="column" gap="3">
        <Heading size="6">{recipe.name}</Heading>
        <Text><strong>Type:</strong> {recipe.type}</Text>
        <Text><strong>Description:</strong> {recipe.description}</Text>
        <Text><strong>Base Stats:</strong> {JSON.stringify(recipe.baseStats)}</Text>
        <Text><strong>Food Effect:</strong> {recipe.foodEffect}</Text>
        <Text><strong>Optional Ingredient:</strong> {recipe.optionalIngredient ?? 'None'}</Text>
        <Text>
          <strong>Ingredients:</strong> {recipe.ingredient1}, {recipe.ingredient2}
          {recipe.ingredient3 && `, ${recipe.ingredient3}`}
          {recipe.ingredient4 && `, ${recipe.ingredient4}`}
        </Text>
        <Text><strong>Base Spoilage Rate:</strong> {recipe.baseSpoilageRate}</Text>
        <Text><strong>Crafting Station:</strong> {recipe.craftingStation}</Text>
        <Text><strong>Rarity:</strong> {recipe.rarity}</Text>

        <Button 
          onClick={() => markAsFoundMutation.mutate(recipe.id)}
          color={theme.accentColor}
        >
          Mark as Found
        </Button>
      </Flex>
    </Card>
  );
};

export default RecipeDetail;