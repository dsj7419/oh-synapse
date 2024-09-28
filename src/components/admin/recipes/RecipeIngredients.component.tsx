import React from 'react';
import type { RecipeDetails, Category } from '@/types/recipe';

interface RecipeIngredientsProps {
  recipe: RecipeDetails;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  categories: Category[];
}

export const RecipeIngredients: React.FC<RecipeIngredientsProps> = ({ recipe, handleInputChange, categories }) => {
  return (
    <>
      <select
        name="optionalIngredient"
        value={recipe.optionalIngredient ?? ''}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      >
        <option value="">None</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="ingredient1"
          value={recipe.ingredient1}
          onChange={handleInputChange}
          placeholder="Ingredient 1"
          className="w-full p-2 border rounded"
          required
        />
        <input
          type="text"
          name="ingredient2"
          value={recipe.ingredient2}
          onChange={handleInputChange}
          placeholder="Ingredient 2"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="ingredient3"
          value={recipe.ingredient3 ?? ''}
          onChange={handleInputChange}
          placeholder="Ingredient 3"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="ingredient4"
          value={recipe.ingredient4 ?? ''}
          onChange={handleInputChange}
          placeholder="Ingredient 4"
          className="w-full p-2 border rounded"
        />
      </div>
    </>
  );
};