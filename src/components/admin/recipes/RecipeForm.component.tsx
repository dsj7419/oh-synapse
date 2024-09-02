'use client';

import React, { useState, useEffect } from 'react';
import { api } from "@/trpc/react";
import { UploadButton } from "@uploadthing/react";

type RecipeDetails = {
  id?: string;
  name: string;
  type: 'Food' | 'Drink' | 'Crafted Ingredient';
  description: string;
  baseStats: Record<string, string | number>;
  foodEffect: string;
  optionalIngredient: string;
  ingredient1: string;
  ingredient2?: string;
  ingredient3?: string;
  ingredient4?: string;
  baseSpoilageRate: string;
  craftingStation: string;
  recipeLocation: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'unique';
  image?: string;
};

interface RecipeFormProps {
  recipeId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const initialRecipeState: RecipeDetails = {
  name: '',
  type: 'Food',
  description: '',
  baseStats: {},
  foodEffect: '',
  optionalIngredient: '',
  ingredient1: '',
  ingredient2: '',
  ingredient3: '',
  ingredient4: '',
  baseSpoilageRate: '24',
  craftingStation: 'Stove',
  recipeLocation: '',
  rarity: 'common',
};

const RecipeForm: React.FC<RecipeFormProps> = ({ recipeId, onSave, onCancel }) => {
  const [recipe, setRecipe] = useState<RecipeDetails>(initialRecipeState);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const { data: categories } = api.category.getAll.useQuery();
  const createOrUpdateMutation = api.recipe.createOrUpdate.useMutation();
  const recipeQuery = api.recipe.getById.useQuery(recipeId ?? '', { 
    enabled: !!recipeId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (recipeId && recipeQuery.data) {
      setRecipe(recipeQuery.data);
    } else if (!recipeId) {
      setRecipe(initialRecipeState);
    }
  }, [recipeId, recipeQuery.data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setRecipe(prev => ({ ...prev, [name]: value }));
  };

  const handleBaseStatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecipe(prev => ({
      ...prev,
      baseStats: { ...prev.baseStats, [name]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const submissionData = {
      ...recipe,
      optionalIngredient: recipe.optionalIngredient === '' ? null : recipe.optionalIngredient,
      image: recipe.image || null, // Explicitly include the image field
    };

    createOrUpdateMutation.mutate(submissionData, {
      onSuccess: () => {
        onSave();
        if (!recipeId) {
          setRecipe(initialRecipeState);
        }
      },
      onError: (error) => {
        console.error('Error creating/updating recipe:', error);
        setError('Failed to save recipe. Please try again.');
      }
    });
  };

  const handleFileUpload = async (res: any) => {
    if (res && res[0]) {
      setRecipe(prev => ({ ...prev, image: res[0].url }));
      setUploadStatus('success');
    } else {
      setUploadStatus('error');
    }
    setTimeout(() => setUploadStatus('idle'), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">{recipeId ? 'Edit Recipe' : 'Create New Recipe'}</h2>
      {error && <div className="text-red-500">{error}</div>}
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
      <div className="grid grid-cols-2 gap-4">
        <input
          type="text"
          name="energy"
          value={recipe.baseStats.energy || ''}
          onChange={handleBaseStatsChange}
          placeholder="Energy"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="hydration"
          value={recipe.baseStats.hydration || ''}
          onChange={handleBaseStatsChange}
          placeholder="Hydration"
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
      <select
        name="optionalIngredient"
        value={recipe.optionalIngredient || 'none'}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      >
        <option value="" disabled>Optional Ingredient</option>
        <option value="none">None</option>
        {categories?.map(category => (
          <option key={category.id} value={category.id}>{category.name}</option>
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
          value={recipe.ingredient2 || ''}
          onChange={handleInputChange}
          placeholder="Ingredient 2"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="ingredient3"
          value={recipe.ingredient3 || ''}
          onChange={handleInputChange}
          placeholder="Ingredient 3"
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          name="ingredient4"
          value={recipe.ingredient4 || ''}
          onChange={handleInputChange}
          placeholder="Ingredient 4"
          className="w-full p-2 border rounded"
        />
      </div>
      <select
        name="baseSpoilageRate"
        value={recipe.baseSpoilageRate}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      >
        <option value="24">24 Hours</option>
        <option value="8">8 Hours</option>
        <option value="12">12 Hours</option>
        <option value="48">48 Hours</option>
        <option value="Unlimited">Unlimited</option>
      </select>
      <select
        name="craftingStation"
        value={recipe.craftingStation}
        onChange={handleInputChange}
        className="w-full p-2 border rounded"
      >
        <option value="Stove">Stove</option>
        <option value="Electric Stove">Electric Stove</option>
        <option value="Kitchen Set">Kitchen Set</option>
        <option value="Fridge">Fridge</option>
        <option value="Meat Dryer">Meat Dryer</option>
      </select>
      <input
        type="text"
        name="recipeLocation"
        value={recipe.recipeLocation}
        onChange={handleInputChange}
        placeholder="Recipe Location"
        className="w-full p-2 border rounded"
      />
      <select
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
      
      <div className="mt-4 flex items-center">
        <UploadButton
          endpoint="imageUploader"
          onClientUploadComplete={handleFileUpload}
          onUploadError={(error: Error) => {
            console.error('Error uploading file:', error);
            const detailedError = (error as any).data?.zodError?.fieldErrors || error.message;
            setError(`Upload failed: ${detailedError}`);
            setUploadStatus('error');
            setTimeout(() => setUploadStatus('idle'), 3000);
          }}
        />
        
        {uploadStatus === 'uploading' && <span className="ml-2 text-blue-500">Uploading...</span>}
        {uploadStatus === 'success' && <span className="ml-2 text-green-500">Upload successful!</span>}
        {uploadStatus === 'error' && <span className="ml-2 text-red-500">Upload failed</span>}
      </div>

      {recipe.image && (
        <div className="mt-4">
          <img src={recipe.image} alt="Recipe" className="w-32 h-32 object-cover rounded" />
        </div>
      )}

      <div className="flex justify-between">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
          disabled={createOrUpdateMutation.isLoading}
        >
          {createOrUpdateMutation.isLoading ? 'Saving...' : (recipeId ? 'Update Recipe' : 'Create Recipe')}
        </button>
        {recipeId && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

export default RecipeForm;
