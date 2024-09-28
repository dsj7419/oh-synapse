import React from 'react';
import type { RecipeDetails } from '@/types/recipe';

interface RecipeStatsProps {
  recipe: RecipeDetails;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  handleBaseStatsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const RecipeStats: React.FC<RecipeStatsProps> = ({
  recipe,
  handleInputChange,
  handleBaseStatsChange
}) => {
  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <input
          type="text"
          name="energy"
          value={recipe.baseStats.energy}
          onChange={handleBaseStatsChange}
          placeholder="Energy"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="hydration"
          value={recipe.baseStats.hydration}
          onChange={handleBaseStatsChange}
          placeholder="Hydration"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="sanity"
          value={recipe.baseStats.sanity}
          onChange={handleBaseStatsChange}
          placeholder="Sanity"
          className="w-full p-2 border rounded"
        />
      </div>
      <input
        type="text"
        name="foodEffect"
        value={recipe.foodEffect}
        onChange={handleInputChange}
        placeholder="Food Effect"
        className="w-full p-2 border rounded"
      />
      <label htmlFor="baseSpoilageRate" className="block mt-4 mb-2">Base Spoilage Rate</label>
      <select
        id="baseSpoilageRate"
        name="baseSpoilageRate"
        value={recipe.baseSpoilageRate}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      >
        <option value="24">24 hours</option>
        <option value="8">8 hours</option>
        <option value="12">12 hours</option>
        <option value="48">48 hours</option>
        <option value="unlimited">Unlimited</option>
      </select>
      <label htmlFor="craftingStation" className="block mt-4 mb-2">Crafting Station</label>
      <select
        id="craftingStation"
        name="craftingStation"
        value={recipe.craftingStation}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      >
        <option value="stove">Stove</option>
        <option value="electric stove">Electric Stove</option>
        <option value="kitchen set">Kitchen Set</option>
        <option value="fridge">Fridge</option>
        <option value="meat dryer">Meat Dryer</option>
      </select>
      <label htmlFor="rarity" className="block mt-4 mb-2">Rarity</label>
      <select
        id="rarity"
        name="rarity"
        value={recipe.rarity}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      >
        <option value="common">Common</option>
        <option value="uncommon">Uncommon</option>
        <option value="rare">Rare</option>
        <option value="unique">Unique</option>
      </select>
    </>
  );
};