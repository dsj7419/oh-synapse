import { useState, useEffect, useCallback } from 'react';
import { api } from "@/trpc/react";
import { useSession } from 'next-auth/react';
import { logAction } from "@/utils/auditLogger";
import type { RecipeDetails } from '@/types/recipe';

const initialRecipeState: RecipeDetails = {
  name: '',
  type: 'Food',
  description: '',
  baseStats: { energy: '', hydration: '', sanity: '' },
  foodEffect: '',
  optionalIngredient: null,
  ingredient1: '',
  ingredient2: '',
  ingredient3: '',
  ingredient4: '',
  baseSpoilageRate: '24',
  craftingStation: 'stove',
  rarity: 'common',
  image: null,
  isComplete: false,
  locationType: 'memetics',
};

export const useRecipeForm = (recipeId?: string) => {
  const [recipe, setRecipe] = useState<RecipeDetails>(initialRecipeState);
  const [error, setError] = useState<string | null>(null);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [isWorldMap, setIsWorldMap] = useState(false);

  const { data: session } = useSession();
  const createOrUpdateMutation = api.recipe.createOrUpdate.useMutation();
  const recipeQuery = api.recipe.getById.useQuery(recipeId ?? '', {
    enabled: !!recipeId,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (recipeId && recipeQuery.data) {
      setRecipe({
        ...initialRecipeState,
        ...recipeQuery.data,
        type: recipeQuery.data.type as RecipeDetails['type'],
        baseStats: {
          energy: (recipeQuery.data.baseStats as Record<string, string | number>).energy?.toString() ?? '',
          hydration: (recipeQuery.data.baseStats as Record<string, string | number>).hydration?.toString() ?? '',
          sanity: (recipeQuery.data.baseStats as Record<string, string | number>).sanity?.toString() ?? '',
        },
        ingredient2: recipeQuery.data.ingredient2 ?? '',
        ingredient3: recipeQuery.data.ingredient3 ?? '',
        ingredient4: recipeQuery.data.ingredient4 ?? '',
        rarity: recipeQuery.data.rarity as RecipeDetails['rarity'],
        isComplete: recipeQuery.data.isComplete,
        locationType: recipeQuery.data.locationType as RecipeDetails['locationType'],
      });
      setIsWorldMap(recipeQuery.data.locationType === 'worldMap');
    } else if (!recipeId) {
      setRecipe(initialRecipeState);
      setIsWorldMap(false);
    }
  }, [recipeId, recipeQuery.data]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({ ...prev, [name]: value }));
  };

  const handleBaseStatsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRecipe((prev) => ({
      ...prev,
      baseStats: {
        ...prev.baseStats,
        [name]: value,
      },
    }));
  };

  const handleSetIsWorldMap = useCallback((value: boolean) => {
    setIsWorldMap(value);
    setRecipe((prev) => ({
      ...prev,
      locationType: value ? 'worldMap' : 'memetics',
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    let updatedIsComplete = false;
    if (recipe.locationType === 'memetics') {
      updatedIsComplete = true;
    } else if (recipe.locationType === 'worldMap' && recipe.location) {
      updatedIsComplete = !!recipe.location.coordinates;
    }

    const recipeData: RecipeDetails = {
      ...recipe,
      isComplete: updatedIsComplete,
      locationType: isWorldMap ? 'worldMap' : 'memetics',
    };

    try {
      await createOrUpdateMutation.mutateAsync(recipeData);
      if (session?.user) {
        await logAction({
          userId: session.user.id,
          username: session.user.name ?? 'unknown',
          userRole: session.user.roles?.join(', ') ?? 'editor',
          action: recipeId ? 'Update Recipe' : 'Create Recipe',
          resourceType: 'recipe',
          resourceId: recipe.id ?? 'unknown',
          severity: 'normal',
          details: {
            name: recipe.name,
            type: recipe.type,
            description: recipe.description,
          },
        });
      }
      if (!recipeId) {
        setRecipe(initialRecipeState);
        setIsWorldMap(false);
      }
      return true;
    } catch (err) {
      console.error('Error creating/updating recipe:', err);
      setError('Failed to save recipe. Please try again.');
      return false;
    }
  };

  return {
    recipe,
    error,
    uploadStatus,
    isWorldMap,
    setRecipe,
    setError,
    setUploadStatus,
    setIsWorldMap: handleSetIsWorldMap,
    handleInputChange,
    handleBaseStatsChange,
    handleSubmit,
  };
};