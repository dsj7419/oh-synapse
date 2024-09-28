import React from 'react';
import type { RecipeDetails } from '@/types/recipe';

interface RecipeBasicInfoProps {
  recipe: RecipeDetails;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
}

export const RecipeBasicInfo: React.FC<RecipeBasicInfoProps> = ({ recipe, handleInputChange }) => {
  return (
    <>
      <input
        type="text"
        name="name"
        value={recipe.name}
        onChange={handleInputChange}
        placeholder="Recipe Name"
        className="w-full p-2 border rounded"
        required
      />
      <select
        name="type"
        value={recipe.type}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      >
        <option value="Food">Food</option>
        <option value="Drink">Drink</option>
        <option value="Crafted Ingredient">Crafted Ingredient</option>
      </select>
      <textarea
        name="description"
        value={recipe.description}
        onChange={handleInputChange}
        placeholder="Description"
        className="w-full p-2 border rounded"
      />
    </>
  );
};