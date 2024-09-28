import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeIngredients } from '@/components/admin/recipes/RecipeIngredients.component';
import { RecipeDetails, Category } from '@/types/recipe';

const mockRecipe: RecipeDetails = {
  name: 'Test Recipe',
  type: 'Food',
  description: 'Test description',
  baseStats: {},
  foodEffect: '',
  optionalIngredient: null,
  ingredient1: 'Ingredient 1',
  ingredient2: 'Ingredient 2',
  ingredient3: 'Ingredient 3',
  ingredient4: 'Ingredient 4',
  baseSpoilageRate: '',
  craftingStation: '',
  rarity: 'common',
  isComplete: false,
  locationType: 'memetics',
};

const mockCategories: Category[] = [
  { id: '1', name: 'Category 1' },
  { id: '2', name: 'Category 2' },
];

describe('RecipeIngredients', () => {
  it('renders input fields with correct values', () => {
    const handleInputChange = jest.fn();
    render(<RecipeIngredients recipe={mockRecipe} handleInputChange={handleInputChange} categories={mockCategories} />);

    expect(screen.getByDisplayValue('Ingredient 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ingredient 2')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ingredient 3')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Ingredient 4')).toBeInTheDocument();
  });

  it('renders category options', () => {
    const handleInputChange = jest.fn();
    render(<RecipeIngredients recipe={mockRecipe} handleInputChange={handleInputChange} categories={mockCategories} />);

    expect(screen.getByText('None')).toBeInTheDocument();
    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });

  it('calls handleInputChange when input values change', () => {
    const handleInputChange = jest.fn();
    render(<RecipeIngredients recipe={mockRecipe} handleInputChange={handleInputChange} categories={mockCategories} />);

    fireEvent.change(screen.getByDisplayValue('Ingredient 1'), { target: { value: 'New Ingredient 1' } });
    fireEvent.change(screen.getByDisplayValue('Ingredient 2'), { target: { value: 'New Ingredient 2' } });

    expect(handleInputChange).toHaveBeenCalledTimes(2);
  });
});