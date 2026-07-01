import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen } from "lucide-react";
import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { RecipeCard } from "@/components/recipe-card";
import { EmptyState } from "@/components/empty-state";
import { DeleteCollectionButton } from "@/components/delete-collection-button";
import type { Recipe } from "@/types";

export const dynamic = "force-dynamic";

export default async function CollectionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const userId = await requireUserId();
  const { id } = await params;

  const collection = await prisma.collection.findFirst({
    where: { id, userId },
    include: {
      recipes: {
        include: {
          recipe: { include: { tags: { include: { tag: true } } } },
        },
        orderBy: { addedAt: "desc" },
      },
    },
  });
  if (!collection) notFound();

  const recipes = collection.recipes.map((r) => r.recipe) as unknown as Recipe[];

  return (
    <div className="space-y-6">
      <Link
        href="/colecciones"
        className="inline-flex items-center gap-1 text-sm text-muted hover:text-foreground"
      >
        <ArrowLeft className="size-4" /> Colecciones
      </Link>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-4xl">{collection.emoji || "📁"}</span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {collection.name}
            </h1>
            <p className="text-sm text-muted">{recipes.length} recetas</p>
          </div>
        </div>
        <DeleteCollectionButton id={collection.id} name={collection.name} />
      </div>

      {recipes.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Colección vacía"
          description="Agregá recetas a esta colección desde el editor de cada receta."
          actionLabel="Ver recetas"
          actionHref="/recetas"
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
