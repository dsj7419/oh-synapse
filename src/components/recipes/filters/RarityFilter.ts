import { FilterStrategy } from './FilterStrategy';

export class RarityFilter implements FilterStrategy {
  filter(recipes: any[], rarity: string): any[] {
    return rarity ? recipes.filter(recipe => recipe.rarity === rarity) : recipes;
  }
}