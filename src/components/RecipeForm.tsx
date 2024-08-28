'use client';

import React, { useState } from 'react';
import { api } from "@/trpc/react";

type BonusStat = {
  id: string;
  name: string;
  effect: string;
};

const RecipeForm: React.FC = () => {
  const [recipe, setRecipe] = useState({
    name: '',
    type: '',
    description: '',
    baseStats: {},
    foodEffect: '',
    optionalIngredient: '',
    ingredient1: '',
    ingredient2: '',
    ingredient3: '',
    ingredient4: '',
    baseSpoilageRate: '',
    craftingStation: '',
    recipeLocation: '',
    rarity: '',
  });

  const [selectedBonusStat, setSelectedBonusStat] = useState<string>('');

  const createRecipeMutation = api.recipe.create.useMutation();
  const bonusStatsQuery = api.bonusStat.getAll.useQuery();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRecipe(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createRecipeMutation.mutate({
      ...recipe,
      baseStats: JSON.parse(JSON.stringify(recipe.baseStats)),
      optionalIngredient: selectedBonusStat,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="name"
        value={recipe.name}
        onChange={handleInputChange}
        placeholder="Recipe Name"
        className="w-full p-2 border rounded"
      />
      <select
        name="type"
        value={recipe.type}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Type</option>
        <option value="Food">Food</option>
        <option value="Drink">Drink</option>
      </select>
      <textarea
        name="description"
        value={recipe.description}
        onChange={handleInputChange}
        placeholder="Description"
        className="w-full p-2 border rounded"
      />
      {/* Add more fields for other recipe properties */}
      
      <select
        value={selectedBonusStat}
        onChange={(e) => setSelectedBonusStat(e.target.value)}
        className="w-full p-2 border rounded"
      >
        <option value="">Select Bonus Stat</option>
        {bonusStatsQuery.data?.map((stat: BonusStat) => (
          <option key={stat.id} value={stat.id}>{stat.name}</option>
        ))}
      </select>
      
      <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
        Create Recipe
      </button>
    </form>
  );
};

export default RecipeForm;