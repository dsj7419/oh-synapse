import React from 'react';
import { useRecipeForm } from '@/hooks/useRecipeForm';
import { RecipeBasicInfo } from './RecipeBasicInfo.component';
import { RecipeIngredients } from './RecipeIngredients.component';
import { RecipeStats } from './RecipeStats.component';
import { RecipeImage } from './RecipeImage.component';
import { api } from "@/trpc/react";
import { Box, Flex, Text, Switch, Button, Heading, Card } from '@radix-ui/themes';

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
    e.preventDefault();
    const success = await handleSubmit(e);
    if (success) {
      onSave();
    }
  };

  return (
    <Card size="3">
      <form data-testid="recipe-form" onSubmit={handleFormSubmit}>
        <Flex direction="column" gap="4">
          <Heading size="5">
            {recipeId ? 'Edit Recipe' : 'Create New Recipe'}
          </Heading>
          
          {error && (
            <Text color="red">
              {error}
            </Text>
          )}

          <Flex align="center">
            <Text mr="2">Memetics</Text>
            <Switch
              checked={isWorldMap}
              onCheckedChange={(checked: boolean) => {
                setIsWorldMap(checked);
                setRecipe((prev) => ({
                  ...prev,
                  locationType: checked ? 'worldMap' : 'memetics',
                }));
              }}
            />
            <Text ml="2">World Map</Text>
          </Flex>

          <Box>
            <RecipeBasicInfo recipe={recipe} handleInputChange={handleInputChange} />
          </Box>

          <Box>
            <RecipeIngredients
              recipe={recipe}
              handleInputChange={handleInputChange}
              categories={categories ?? []}
            />
          </Box>

          <Box>
            <RecipeStats
              recipe={recipe}
              handleInputChange={handleInputChange}
              handleBaseStatsChange={handleBaseStatsChange}
            />
          </Box>

          <Box>
            <RecipeImage
              recipe={recipe}
              uploadStatus={uploadStatus}
              setUploadStatus={setUploadStatus}
              setRecipe={setRecipe}
              setError={setError}
            />
          </Box>

          <Box>
            <Heading size="3" mb="2">Location</Heading>
            <Card variant="surface">
              <Text>
                {recipe.locationType === 'memetics'
                  ? 'Memetics'
                  : (recipe.location ? 'Location filled out' : 'Location not filled out')
                }
              </Text>
            </Card>
          </Box>

          <Flex justify="between" mt="4">
            <Button type="submit">
              {recipeId ? 'Update Recipe' : 'Create Recipe'}
            </Button>
            {recipeId && (
              <Button type="button" onClick={onCancel} variant="soft">
                Cancel
              </Button>
            )}
          </Flex>
        </Flex>
      </form>
    </Card>
  );
};

export default RecipeForm;