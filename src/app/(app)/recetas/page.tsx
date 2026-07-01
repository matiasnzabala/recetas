import { BookOpen } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { listRecipes } from "@/lib/data/recipes";
import { SearchBar } from "@/components/search-bar";
import { RecipeFilters } from "@/components/recipe-filters";
import { RecipeCard } from "@/components/recipe-card";
import { EmptyState } from "@/components/empty-state";
import type { Recipe } from "@/types";

export const dynamic = "force-dynamic";

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const userId = await requireUserId();
  const sp = await searchParams;

  const recipes = (await listRecipes(userId, {
    q: sp.q,
    status: sp.status,
    mealType: sp.mealType,
    favorite: sp.favorite === "true",
    tag: sp.tag,
    author: sp.author,
    sort: sp.sort as "recent" | "rating" | "cooked" | "title" | undefined,
  })) as unknown as Recipe[];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Recetas</h1>
        <p className="text-sm text-muted">
          {recipes.length} {recipes.length === 1 ? "receta" : "recetas"}
          {sp.q ? ` para “${sp.q}”` : ""}
        </p>
      </div>

      <SearchBar defaultValue={sp.q ?? ""} />
      <RecipeFilters />

      {recipes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No hay recetas"
          description={
            sp.q
              ? "Probá con otra búsqueda o filtro."
              : "Agregá tu primera receta para empezar."
          }
          actionLabel="Agregar receta"
          actionHref="/agregar"
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {recipes.map((r) => (
            <RecipeCard key={r.id} recipe={r} />
          ))}
        </div>
      )}
    </div>
  );
}
