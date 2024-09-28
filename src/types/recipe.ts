export interface RecipeDetails {
  id?: string;
  name: string;
  type: 'Food' | 'Drink' | 'Crafted Ingredient';
  description: string;
  baseStats: Record<string, string | number>;
  foodEffect: string;
  optionalIngredient: string | null;
  ingredient1: string;
  ingredient2: string;
  ingredient3: string;
  ingredient4: string;
  baseSpoilageRate: string;
  craftingStation: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'unique';
  image?: string | null;
  isComplete: boolean;
  locationType: 'memetics' | 'worldMap';
  createdBy?: {
    id: string;
    name: string | null;
    email: string | null;
    emailVerified: Date | null;
    image: string | null;
    createdAt: Date;
    updatedAt: Date;
    banned: boolean;
  };
  location?: {
    id: string;
    recipeId: string;
    coordinates: string | null;
    description: string | null;
    image1: string | null;
    image2: string | null;
    region: string | null;
    locationName: string | null;
  } | null;
}

export interface Category {
  id: string;
  name: string;
}