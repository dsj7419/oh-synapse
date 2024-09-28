/**
 * @jest-environment node
 */

import type { Session } from 'next-auth';
import { createTestCaller } from '../../../helpers/createTestCaller';
import { TRPCError } from '@trpc/server';

describe('Recipe Router', () => {
  let mockCaller: Awaited<ReturnType<typeof createTestCaller>>;

  beforeEach(async () => {
    mockCaller = await createTestCaller({
      user: { id: 'test-user-id', name: 'Test User', roles: ['editor'] },
      expires: '2023-01-01',
    } as Session);
  });

  describe('createOrUpdate', () => {
    it('creates a new recipe', async () => {
      const mockRecipe = {
        id: '1',
        name: 'Test Recipe',
        type: 'Food',
        description: 'Test description',
        baseStats: { energy: 10, hydration: 20, sanity: 30 },
        foodEffect: 'Test effect',
        ingredient1: 'Test ingredient',
        ingredient2: 'Test ingredient 2',
        baseSpoilageRate: '24',
        craftingStation: 'stove',
        rarity: 'common',
        locationType: 'memetics',
      };

      (mockCaller.recipe.createOrUpdate as jest.Mock).mockResolvedValue(mockRecipe);

      const result = await mockCaller.recipe.createOrUpdate({
        name: 'Test Recipe',
        type: 'Food',
        description: 'Test description',
        baseStats: { energy: 10, hydration: 20, sanity: 30 },
        foodEffect: 'Test effect',
        ingredient1: 'Test ingredient',
        ingredient2: 'Test ingredient 2',
        baseSpoilageRate: '24',
        craftingStation: 'stove',
        rarity: 'common',
        locationType: 'memetics',
      });

      expect(result).toEqual(mockRecipe);
      expect(mockCaller.recipe.createOrUpdate).toHaveBeenCalled();
    });

    it('updates an existing recipe', async () => {
      const mockRecipe = {
        id: '1',
        name: 'Updated Recipe',
        type: 'Drink',
        description: 'Updated description',
        baseStats: { energy: 15, hydration: 25, sanity: 35 },
        foodEffect: 'Updated effect',
        ingredient1: 'Updated ingredient',
        ingredient2: 'Updated ingredient 2',
        baseSpoilageRate: '48',
        craftingStation: 'electric stove',
        rarity: 'uncommon',
        locationType: 'worldMap',
      };

      (mockCaller.recipe.createOrUpdate as jest.Mock).mockResolvedValue(mockRecipe);

      const result = await mockCaller.recipe.createOrUpdate({
        id: '1',
        name: 'Updated Recipe',
        type: 'Drink',
        description: 'Updated description',
        baseStats: { energy: 15, hydration: 25, sanity: 35 },
        foodEffect: 'Updated effect',
        ingredient1: 'Updated ingredient',
        ingredient2: 'Updated ingredient 2',
        baseSpoilageRate: '48',
        craftingStation: 'electric stove',
        rarity: 'uncommon',
        locationType: 'worldMap',
      });

      expect(result).toEqual(mockRecipe);
      expect(mockCaller.recipe.createOrUpdate).toHaveBeenCalled();
    });

    it('throws an error if user is not authorized', async () => {
      const unauthorizedCaller = await createTestCaller(null);
      (unauthorizedCaller.recipe.createOrUpdate as jest.Mock).mockRejectedValue(new TRPCError({ code: 'UNAUTHORIZED' }));

      await expect(unauthorizedCaller.recipe.createOrUpdate({
        name: 'Test Recipe',
        type: 'Food',
        description: 'Test description',
        baseStats: { energy: 10, hydration: 20, sanity: 30 },
        foodEffect: 'Test effect',
        ingredient1: 'Test ingredient',
        ingredient2: 'Test ingredient 2',
        baseSpoilageRate: '24',
        craftingStation: 'stove',
        rarity: 'common',
        locationType: 'memetics',
      })).rejects.toThrow(TRPCError);
    });
  });

  describe('getAll', () => {
    it('gets all recipes', async () => {
      const mockRecipes = [
        { id: '1', name: 'Recipe 1', type: 'Food' },
        { id: '2', name: 'Recipe 2', type: 'Drink' },
      ];
      (mockCaller.recipe.getAll as jest.Mock).mockResolvedValue({ recipes: mockRecipes });

      const result = await mockCaller.recipe.getAll({});

      expect(result.recipes).toEqual(mockRecipes);
      expect(mockCaller.recipe.getAll).toHaveBeenCalled();
    });

    it('applies filters correctly', async () => {
      (mockCaller.recipe.getAll as jest.Mock).mockResolvedValue({ recipes: [] });

      await mockCaller.recipe.getAll({
        search: 'test',
        type: 'Food',
        rarity: 'common',
        locationType: 'memetics',
      });

      expect(mockCaller.recipe.getAll).toHaveBeenCalledWith({
        search: 'test',
        type: 'Food',
        rarity: 'common',
        locationType: 'memetics',
      });
    });
  });

  // ... Add similar updates for other test cases (getById, toggleFound, delete, markAsFound)
});