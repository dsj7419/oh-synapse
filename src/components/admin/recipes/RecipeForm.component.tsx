import React from 'react';
import { Switch } from '@headlessui/react';
import { useRecipeForm } from '@/hooks/useRecipeForm';
import { RecipeBasicInfo } from './RecipeBasicInfo.component';
import { RecipeIngredients } from './RecipeIngredients.component';
import { RecipeStats } from './RecipeStats.component';
import { RecipeImage } from './RecipeImage.component';
import { api } from "@/trpc/react";
import type { RecipeDetails } from '@/types/recipe';

interface RecipeFormProps {
  recipeId?: string;
  onSave: () => void;
  onCancel: () => void;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipeId, onSave, onCancel }) => {
  const {
    recipe,
    error,
    uploadStatus,
    isWorldMap,
    setRecipe,
    setError,
    setUploadStatus,
    setIsWorldMap,
    handleInputChange,
    handleBaseStatsChange,
    handleSubmit,
  } = useRecipeForm(recipeId);

  const { data: categories } = api.category.getAll.useQuery();

  const handleFormSubmit = async (e: React.FormEvent) => {
    const success = await handleSubmit(e);
    if (success) {
      onSave();
    }
  };

  return (
    <form data-testid="recipe-form" onSubmit={handleFormSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">{recipeId ? 'Edit Recipe' : 'Create New Recipe'}</h2>
      {error && <div className="text-red-500">{error}</div>}
      <div className="flex items-center mb-4">
        <span className="mr-2">Memetics</span>
        <Switch
          checked={isWorldMap}
          onChange={(checked: boolean) => {
            setIsWorldMap(checked);
            setRecipe((prev) => ({
              ...prev,
              locationType: checked ? 'worldMap' : 'memetics',
            }));
          }}
          className={`${
            isWorldMap ? 'bg-blue-600' : 'bg-gray-200'
          } relative inline-flex h-6 w-11 items-center rounded-full`}
        >
          <span
            className={`${
              isWorldMap ? 'translate-x-6' : 'translate-x-1'
            } inline-block h-4 w-4 transform rounded-full bg-white transition`}
          />
        </Switch>
        <span className="ml-2">World Map</span>
      </div>
      <RecipeBasicInfo recipe={recipe} handleInputChange={handleInputChange} />
      <RecipeIngredients recipe={recipe} handleInputChange={handleInputChange} categories={categories ?? []} />
      <RecipeStats recipe={recipe} handleInputChange={handleInputChange} handleBaseStatsChange={handleBaseStatsChange} />
      <RecipeImage
        recipe={recipe}
        uploadStatus={uploadStatus}
        setUploadStatus={setUploadStatus}
        setRecipe={setRecipe}
        setError={setError}
      />
      <div className="mt-4">
        <h3 className="text-lg font-bold mb-2">Location</h3>
        {recipe.locationType === 'memetics' ? (
          <div className="p-2 border rounded bg-gray-100">Memetics</div>
        ) : (
          <div className="p-2 border rounded bg-gray-100">
            {recipe.location ? 'Location filled out' : 'Location not filled out'}
          </div>
        )}
      </div>
      <div className="flex justify-between">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {recipeId ? 'Update Recipe' : 'Create Recipe'}
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