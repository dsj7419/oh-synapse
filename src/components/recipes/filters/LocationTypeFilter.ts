import { type FilterStrategy } from './FilterStrategy';

export class LocationTypeFilter implements FilterStrategy {
  filter(recipes: any[], locationType: string): any[] {
    return locationType
      ? recipes.filter((recipe) => recipe.locationType === locationType)
      : recipes;
  }
}
