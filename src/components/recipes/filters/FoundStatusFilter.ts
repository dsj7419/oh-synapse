import { FilterStrategy } from './FilterStrategy';

export class FoundStatusFilter implements FilterStrategy {
  filter(recipes: any[], foundStatus: string): any[] {
    return foundStatus ? recipes.filter(recipe => recipe.foundStatus === foundStatus) : recipes;
  }
}