import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import type { Recipe, RecipeLocation, BonusStat } from '@prisma/client';
import RecipeLocationPopover from './RecipeLocationPopover.component';

interface RecipeCardProps {
  recipe: Recipe & { location?: RecipeLocation | null; isFound: boolean };
  onToggleFound: () => void;
  bonusStats: BonusStat[];
  disableSwipe: (state: boolean) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onToggleFound, bonusStats, disableSwipe }) => {
  const [selectedIngredient, setSelectedIngredient] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);

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

  const handleIngredientChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedIngredient(e.target.value);
    setIsDropdownOpen(false);
    disableSwipe(false); 
  }, [disableSwipe]);

  const handleDropdownOpen = useCallback(() => {
    setIsDropdownOpen(true);
    disableSwipe(true); 
  }, [disableSwipe]);

  const handleDropdownClose = useCallback(() => {
    setIsDropdownOpen(false);
    disableSwipe(false); 
    if (selectRef.current) {
      selectRef.current.blur();
    }
  }, [disableSwipe]);

  // Add the event listener for when the dropdown is open, and remove it when it's closed
  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleDropdownClose);
      return () => {
        document.removeEventListener('mousedown', handleDropdownClose);
      };
    }
  }, [isDropdownOpen, handleDropdownClose]);

  const rarityColor = rarityColors[recipe.rarity as keyof typeof rarityColors];

  return (
    <div className={`border-2 rounded-lg overflow-hidden flex flex-col items-center justify-between w-[400px] h-[600px] ${rarityColor} transition-all duration-300 hover:shadow-lg`}>
      <div className="relative w-full h-[40%] select-none pointer-events-none">
        <Image 
          src={recipe.image ?? '/placeholder-recipe.jpg'} 
          alt={recipe.name}
          layout="fill"
          objectFit="cover"
          className="transition-transform duration-300 hover:scale-105"
          draggable={false}
        />
        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
          {recipe.type}
        </div>
      </div>
      <div className="p-4 flex-1 select-none">
        <h2 className="text-2xl font-bold mb-2 text-center">{recipe.name}</h2>
        <p className="text-sm mb-2 text-center">{recipe.description}</p>
        <div className="grid grid-cols-1 gap-2 text-sm">
          <p><span className="font-semibold">Base Stats:</span> {Object.entries(recipe.baseStats ?? {}).map(([key, value]) => `${key}: ${value}`).join(', ')}</p>
          <p><span className="font-semibold">Food Effect:</span> {recipe.foodEffect}</p>
          <p><span className="font-semibold">Ingredients:</span> {[recipe.ingredient1, recipe.ingredient2, recipe.ingredient3, recipe.ingredient4].filter(Boolean).join(', ')}</p>
          <p><span className="font-semibold">Base Spoilage Rate:</span> {recipe.baseSpoilageRate}</p>
          <p><span className="font-semibold">Crafting Station:</span> {recipe.craftingStation}</p>
          <p><span className="font-semibold">Recipe Location:</span> 
            {recipe.locationType === 'memetics' ? (
              'Memetic Tree'
            ) : recipe.location ? (
              <RecipeLocationPopover location={recipe.location} rarityColor={rarityColor} />
            ) : (
              'Location not set'
            )}
          </p>
        </div>
        <div className="mt-2">
          <span className="font-semibold">Optional Ingredient: </span>
          {recipe.optionalIngredient ? (
            <select
              ref={selectRef}
              value={selectedIngredient}
              onChange={handleIngredientChange}
              onFocus={handleDropdownOpen}
              onBlur={handleDropdownClose}
              className="ml-2 p-1 border rounded"
            >
              <option value="">Select an ingredient</option>
              {bonusStats
                .filter(stat => stat.categoryId === recipe.optionalIngredient)
                .map(stat => (
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
      <div className="mt-4 flex justify-between items-center w-full px-4">
        <span className={`px-2 py-1 rounded text-sm ${rarityColor}`}>
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
  );
};

export default React.memo(RecipeCard);
