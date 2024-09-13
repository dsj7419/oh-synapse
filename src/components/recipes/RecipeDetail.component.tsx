'use client';

import React from 'react';
import { api } from "@/trpc/react";

interface RecipeDetailProps {
  recipeId: string;
}

const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipeId }) => {
  const recipeQuery = api.recipe.getById.useQuery(recipeId);
  const markAsFoundMutation = api.recipe.markAsFound.useMutation();

  if (recipeQuery.isLoading) return <p>Loading...</p>;
  if (recipeQuery.isError) return <p>Error: {recipeQuery.error.message}</p>;
  if (!recipeQuery.data) return <p>Recipe not found</p>;

  const recipe = recipeQuery.data;

  return (
    <div>
      <h1>{recipe.name}</h1>
      <p>Type: {recipe.type}</p>
      <p>Description: {recipe.description}</p>
      <p>Base Stats: {JSON.stringify(recipe.baseStats)}</p>
      <p>Food Effect: {recipe.foodEffect}</p>
      <p>Optional Ingredient: {recipe.optionalIngredient ?? 'None'}</p>
      <p>Ingredients: {recipe.ingredient1}, {recipe.ingredient2}
        {recipe.ingredient3 && `, ${recipe.ingredient3}`}
        {recipe.ingredient4 && `, ${recipe.ingredient4}`}
      </p>
      <p>Base Spoilage Rate: {recipe.baseSpoilageRate}</p>
      <p>Crafting Station: {recipe.craftingStation}</p>
      <p>Rarity: {recipe.rarity}</p>

      <button onClick={() => markAsFoundMutation.mutate(recipe.id)}>
        Mark as Found
      </button>
    </div>
  );
};

export default RecipeDetail;
