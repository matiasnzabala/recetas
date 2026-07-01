import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/session";
import { getRecipe } from "@/lib/data/recipes";
import { RecipeDetail } from "@/components/recipe-detail";
import type { Recipe } from "@/types";

export const dynamic = "force-dynamic";

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const recipe = await getRecipe(userId, id);
  if (!recipe) notFound();

  return <RecipeDetail recipe={recipe as unknown as Recipe} />;
}
