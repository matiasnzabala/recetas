import { notFound } from "next/navigation";
import { requireUserId } from "@/lib/session";
import { getRecipe } from "@/lib/data/recipes";
import { RecipeForm } from "@/components/recipe-form";
import type { Recipe } from "@/types";

export const dynamic = "force-dynamic";

export default async function EditRecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;
  const recipe = await getRecipe(userId, id);
  if (!recipe) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Editar receta</h1>
      <RecipeForm initial={recipe as unknown as Recipe} recipeId={id} />
    </div>
  );
}
