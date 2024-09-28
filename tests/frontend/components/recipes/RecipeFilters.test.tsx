import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import RecipeFilters from '@/components/recipes/RecipeFilters.component';

const mockOnFilterChange = jest.fn();

const filters = {
  type: '',
  rarity: '',
  foundStatus: '',
  locationType: '',
};

describe('RecipeFilters', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders all filter dropdowns correctly', () => {
    render(<RecipeFilters filters={filters} onFilterChange={mockOnFilterChange} />);

    expect(screen.getByDisplayValue('All Types')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Rarities')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Finds')).toBeInTheDocument();
    expect(screen.getByDisplayValue('All Locations')).toBeInTheDocument();
  });

  it('calls onFilterChange when type filter changes', () => {
    render(<RecipeFilters filters={filters} onFilterChange={mockOnFilterChange} />);

    fireEvent.change(screen.getByDisplayValue('All Types'), { target: { value: 'Food' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ ...filters, type: 'Food' });
  });

  it('calls onFilterChange when rarity filter changes', () => {
    render(<RecipeFilters filters={filters} onFilterChange={mockOnFilterChange} />);

    fireEvent.change(screen.getByDisplayValue('All Rarities'), { target: { value: 'rare' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ ...filters, rarity: 'rare' });
  });

  it('calls onFilterChange when found status filter changes', () => {
    render(<RecipeFilters filters={filters} onFilterChange={mockOnFilterChange} />);

    fireEvent.change(screen.getByDisplayValue('All Finds'), { target: { value: 'found' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ ...filters, foundStatus: 'found' });
  });

  it('calls onFilterChange when location filter changes', () => {
    render(<RecipeFilters filters={filters} onFilterChange={mockOnFilterChange} />);

    fireEvent.change(screen.getByDisplayValue('All Locations'), { target: { value: 'worldMap' } });

    expect(mockOnFilterChange).toHaveBeenCalledWith({ ...filters, locationType: 'worldMap' });
  });
});
