import { notFound } from "next/navigation";
import RecipeDetail from '@/components/RecipeDetail';

interface RecipePageProps {
  params: { id: string };
}

export default function RecipePage({ params }: RecipePageProps) {
  if (!params.id) {
    notFound();
  }

  return <RecipeDetail recipeId={params.id} />;
}