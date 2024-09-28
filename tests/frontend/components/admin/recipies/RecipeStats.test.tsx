import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { RecipeStats } from '@/components/admin/recipes/RecipeStats.component';
import { RecipeDetails } from '@/types/recipe';

const mockRecipe: RecipeDetails = {
  name: 'Test Recipe',
  type: 'Food',
  description: 'Test description',
  baseStats: {
    energy: '10',
    hydration: '20',
    sanity: '30'
  },
  foodEffect: 'Test effect',
  optionalIngredient: null,
  ingredient1: '',
  ingredient2: '',
  ingredient3: '',
  ingredient4: '',
  baseSpoilageRate: '24',
  craftingStation: 'stove',
  rarity: 'common',
  isComplete: false,
  locationType: 'memetics',
};

describe('RecipeStats', () => {
  it('renders input fields with correct values', () => {
    const handleInputChange = jest.fn();
    const handleBaseStatsChange = jest.fn();

    render(
      <RecipeStats
        recipe={mockRecipe}
        handleInputChange={handleInputChange}
        handleBaseStatsChange={handleBaseStatsChange}
      />
    );

    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
    expect(screen.getByDisplayValue('20')).toBeInTheDocument();
    expect(screen.getByDisplayValue('30')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test effect')).toBeInTheDocument();
    
    expect(screen.getByLabelText('Base Spoilage Rate')).toHaveValue('24');
    expect(screen.getByLabelText('Crafting Station')).toHaveValue('stove');
    expect(screen.getByLabelText('Rarity')).toHaveValue('common');
  });

  it('calls handleBaseStatsChange when base stats change', () => {
    const handleInputChange = jest.fn();
    const handleBaseStatsChange = jest.fn();

    render(
      <RecipeStats
        recipe={mockRecipe}
        handleInputChange={handleInputChange}
        handleBaseStatsChange={handleBaseStatsChange}
      />
    );

    fireEvent.change(screen.getByDisplayValue('10'), { target: { value: '15' } });
    expect(handleBaseStatsChange).toHaveBeenCalledTimes(1);
  });

  it('calls handleInputChange when other inputs change', () => {
    const handleInputChange = jest.fn();
    const handleBaseStatsChange = jest.fn();

    render(
      <RecipeStats
        recipe={mockRecipe}
        handleInputChange={handleInputChange}
        handleBaseStatsChange={handleBaseStatsChange}
      />
    );

    fireEvent.change(screen.getByDisplayValue('Test effect'), { target: { value: 'New effect' } });
    fireEvent.change(screen.getByLabelText('Base Spoilage Rate'), { target: { value: '48' } });
    fireEvent.change(screen.getByLabelText('Crafting Station'), { target: { value: 'electric stove' } });
    fireEvent.change(screen.getByLabelText('Rarity'), { target: { value: 'rare' } });

    expect(handleInputChange).toHaveBeenCalledTimes(4);
  });
});