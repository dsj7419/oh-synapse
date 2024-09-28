import { FilterStrategy } from './FilterStrategy';

export class TypeFilter implements FilterStrategy {
  filter(recipes: any[], type: string): any[] {
    return type ? recipes.filter(recipe => recipe.type === type) : recipes;
  }
}