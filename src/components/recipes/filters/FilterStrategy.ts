export interface FilterStrategy {
    filter(recipes: any[], criteria: string): any[];
  }
  