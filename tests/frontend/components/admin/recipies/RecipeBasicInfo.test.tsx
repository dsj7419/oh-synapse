import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeBasicInfo } from '@/components/admin/recipes/RecipeBasicInfo.component';
import { RecipeDetails } from '@/types/recipe';

const mockRecipe: RecipeDetails = {
  name: 'Test Recipe',
  type: 'Food',
  description: 'Test description',
  baseStats: {},
  foodEffect: '',
  optionalIngredient: null,
  ingredient1: '',
  ingredient2: '',
  ingredient3: '',
  ingredient4: '',
  baseSpoilageRate: '',
  craftingStation: '',
  rarity: 'common',
  isComplete: false,
  locationType: 'memetics',
};

describe('RecipeBasicInfo', () => {
  it('renders input fields with correct values', () => {
    const handleInputChange = jest.fn();
    render(<RecipeBasicInfo recipe={mockRecipe} handleInputChange={handleInputChange} />);

    expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Food')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
  });

  it('calls handleInputChange when input values change', () => {
    const handleInputChange = jest.fn();
    render(<RecipeBasicInfo recipe={mockRecipe} handleInputChange={handleInputChange} />);

    fireEvent.change(screen.getByDisplayValue('Test Recipe'), { target: { value: 'New Recipe Name' } });
    fireEvent.change(screen.getByDisplayValue('Food'), { target: { value: 'Drink' } });
    fireEvent.change(screen.getByDisplayValue('Test description'), { target: { value: 'New description' } });

    expect(handleInputChange).toHaveBeenCalledTimes(3);
  });
});