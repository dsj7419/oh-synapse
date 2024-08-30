import React, { useState } from 'react';
import Image from 'next/image';
import { Recipe, RecipeLocation, BonusStat } from '@prisma/client';

interface RecipeCardProps {
  recipe: Recipe & { location?: RecipeLocation; isFound: boolean };
  onToggleFound: () => void;
  bonusStats: BonusStat[];
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onToggleFound, bonusStats }) => {
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');

  const rarityColors = {
    common: 'border-green-500 bg-green-50',
    uncommon: 'border-blue-500 bg-blue-50',
    rare: 'border-purple-500 bg-purple-50',
    unique: 'border-orange-500 bg-orange-50',
  };

  const getBonusEffect = () => {
    const selectedStat = bonusStats.find(stat => stat.name === selectedIngredient);
    return selectedStat ? selectedStat.effect : '';
  };

  return (
    <div className={`border-2 rounded-lg overflow-hidden flex ${rarityColors[recipe.rarity as keyof typeof rarityColors]} transition-all duration-300 hover:shadow-lg`}>
      <div className="w-1/4 relative">
        <Image 
          src={recipe.image || '/placeholder-recipe.jpg'} 
          alt={recipe.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-105"
        />
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          {recipe.type}
        </div>
      </div>
      <div className="w-3/4 p-4 flex flex-col justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">{recipe.name}</h2>
          <p className="text-sm mb-2">{recipe.description}</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <p><span className="font-semibold">Base Stats:</span> {Object.entries(recipe.baseStats).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
            <p><span className="font-semibold">Food Effect:</span> {recipe.foodEffect}</p>
            <p><span className="font-semibold">Ingredients:</span> {[recipe.ingredient1, recipe.ingredient2, recipe.ingredient3, recipe.ingredient4].filter(Boolean).join(', ')}</p>
            <p><span className="font-semibold">Base Spoilage Rate:</span> {recipe.baseSpoilageRate}</p>
            <p><span className="font-semibold">Crafting Station:</span> {recipe.craftingStation}</p>
            <p><span className="font-semibold">Recipe Location:</span> {recipe.recipeLocation}</p>
          </div>
          <div className="mt-2">
            <span className="font-semibold">Optional Ingredient: </span>
            {recipe.optionalIngredient ? (
              <select
                value={selectedIngredient}
                onChange={(e) => setSelectedIngredient(e.target.value)}
                className="ml-2 p-1 border rounded"
              >
                <option value="">Select an ingredient</option>
                {bonusStats.map(stat => (
                  <option key={stat.id} value={stat.name}>{stat.name}</option>
                ))}
              </select>
            ) : (
              <span>None</span>
            )}
          </div>
          {selectedIngredient && (
            <p className="mt-2 text-sm"><span className="font-semibold">Bonus Effect:</span> {getBonusEffect()}</p>
          )}
        </div>
        <div className="mt-4 flex justify-between items-center">
          <span className={`px-2 py-1 rounded text-sm ${rarityColors[recipe.rarity as keyof typeof rarityColors]}`}>
            {recipe.rarity.charAt(0).toUpperCase() + recipe.rarity.slice(1)}
          </span>
          <button
            onClick={onToggleFound}
            className={`px-4 py-2 rounded transition-colors duration-300 ${
              recipe.isFound
                ? 'bg-green-500 text-white hover:bg-green-600'
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            {recipe.isFound ? 'Found' : 'Mark as Found'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;