import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeForm from '@/components/admin/recipes/RecipeForm.component';
import { useRecipeForm } from '@/hooks/useRecipeForm';
import { RecipeDetails } from '@/types/recipe';
import * as auditLogger from "@/utils/auditLogger";
import { ThemeProvider } from '@/context/ThemeContext';

jest.mock('@/hooks/useRecipeForm');
jest.mock("@/utils/auditLogger", () => ({
  logAction: jest.fn(),
}));

const mockedUseRecipeForm = useRecipeForm as jest.MockedFunction<typeof useRecipeForm>;

jest.mock('@/trpc/react', () => ({
  api: {
    category: {
      getAll: {
        useQuery: jest.fn(() => ({
          data: [{ id: '1', name: 'Category 1' }],
          isLoading: false,
        })),
      },
    },
    recipe: {
      createOrUpdate: {
        useMutation: jest.fn(() => ({
          mutateAsync: jest.fn(),
          isPending: false,
        })),
      },
      getById: {
        useQuery: jest.fn(() => ({
          data: null,
          isLoading: false
        })),
      },
    },
  },
}));

jest.mock('next-auth/react', () => ({
  useSession: jest.fn(() => ({
    data: {
      user: {
        id: 'test-user-id',
        name: 'Test User',
        roles: ['editor'],
      },
    },
  })),
}));

const mockRecipe: RecipeDetails = {
  name: 'Test Recipe',
  type: 'Food',
  description: 'Test description',
  baseStats: {
    energy: '10',
    hydration: '20',
    sanity: '30',
  },
  foodEffect: 'Test effect',
  optionalIngredient: null,
  ingredient1: 'Ingredient 1',
  ingredient2: 'Ingredient 2',
  ingredient3: 'Ingredient 3',
  ingredient4: 'Ingredient 4',
  baseSpoilageRate: '24',
  craftingStation: 'stove',
  rarity: 'common',
  isComplete: false,
  locationType: 'memetics',
};

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

interface UseRecipeFormReturn {
  recipe: RecipeDetails;
  error: string | null;
  uploadStatus: UploadStatus;
  isWorldMap: boolean;
  setRecipe: React.Dispatch<React.SetStateAction<RecipeDetails>>;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  setUploadStatus: React.Dispatch<React.SetStateAction<UploadStatus>>;
  setIsWorldMap: React.Dispatch<React.SetStateAction<boolean>>;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleBaseStatsChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSubmit: (e: React.FormEvent) => Promise<boolean>;
}

describe('RecipeForm', () => {
  let initialUseRecipeFormReturn: UseRecipeFormReturn;

  beforeEach(() => {
    jest.clearAllMocks();
    initialUseRecipeFormReturn = {
      recipe: mockRecipe,
      error: null,
      uploadStatus: 'idle',
      isWorldMap: false,
      setRecipe: jest.fn(),
      setError: jest.fn(),
      setUploadStatus: jest.fn(),
      setIsWorldMap: jest.fn(),
      handleInputChange: jest.fn(),
      handleBaseStatsChange: jest.fn(),
      handleSubmit: jest.fn(async () => true),
    };
    mockedUseRecipeForm.mockReturnValue(initialUseRecipeFormReturn);
  });

  const renderWithProviders = (component: React.ReactElement) => {
    return render(<ThemeProvider>{component}</ThemeProvider>); 
  };

  it('renders correctly for new recipe', async () => {
    renderWithProviders(<RecipeForm onSave={jest.fn()} onCancel={jest.fn()} />);
    await waitFor(() => {
      expect(screen.getByText('Create New Recipe')).toBeInTheDocument();
    });
    expect(screen.getByText('Create Recipe')).toBeInTheDocument();
    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('calls onSave after successful submission', async () => {
    const mockOnSave = jest.fn();
    renderWithProviders(<RecipeForm onSave={mockOnSave} onCancel={jest.fn()} />);
    const form = screen.getByTestId('recipe-form');

    await act(async () => {
      fireEvent.submit(form);
    });

    await waitFor(() => {
      expect(initialUseRecipeFormReturn.handleSubmit).toHaveBeenCalled();
      expect(mockOnSave).toHaveBeenCalled();
    });
  });

  it('displays error message when there is an error', () => {
    mockedUseRecipeForm.mockReturnValue({
      ...initialUseRecipeFormReturn,
      error: 'Test error',
    });
    renderWithProviders(<RecipeForm onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText('Test error')).toBeInTheDocument();
  });

  it('renders cancel button when editing a recipe', () => {
    renderWithProviders(<RecipeForm recipeId="123" onSave={jest.fn()} onCancel={jest.fn()} />);
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByText('Update Recipe')).toBeInTheDocument();
  });

  it('calls onCancel when cancel button is clicked', async () => {
    const mockOnCancel = jest.fn();
    renderWithProviders(<RecipeForm recipeId="123" onSave={jest.fn()} onCancel={mockOnCancel} />);
    const cancelButton = screen.getByText('Cancel');
    await userEvent.click(cancelButton);
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('toggles between Memetics and World Map', async () => {
    let isWorldMap = false;
    const setRecipeMock = jest.fn();
    const setIsWorldMapMock = jest.fn((value) => {
      isWorldMap = value;
    });
    
    const useRecipeFormMock = () => ({
      ...initialUseRecipeFormReturn,
      setRecipe: setRecipeMock,
      setIsWorldMap: setIsWorldMapMock,
      isWorldMap,
    });
  
    mockedUseRecipeForm.mockImplementation(useRecipeFormMock);
  
    const { rerender } = renderWithProviders(<RecipeForm onSave={jest.fn()} onCancel={jest.fn()} />);
    const toggle = screen.getByRole('switch');
    expect(toggle).toBeInTheDocument();
  
    await userEvent.click(toggle);
    expect(setIsWorldMapMock).toHaveBeenCalledWith(true);
    expect(setRecipeMock).toHaveBeenCalledWith(expect.any(Function));
    
    const setRecipeArg = setRecipeMock.mock.calls[0][0];
    const result = setRecipeArg({ locationType: 'memetics' });
    expect(result).toEqual(expect.objectContaining({ locationType: 'worldMap' }));
  
    rerender(<RecipeForm onSave={jest.fn()} onCancel={jest.fn()} />);
  
    await userEvent.click(toggle);
    expect(setIsWorldMapMock).toHaveBeenCalledWith(false);
    expect(setRecipeMock).toHaveBeenCalledWith(expect.any(Function));
    
    const setRecipeArg2 = setRecipeMock.mock.calls[1][0];
    const result2 = setRecipeArg2({ locationType: 'worldMap' });
    expect(result2).toEqual(expect.objectContaining({ locationType: 'memetics' }));
  });
});
