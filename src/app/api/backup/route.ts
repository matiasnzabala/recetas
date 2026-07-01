import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";

/** Exporta toda la base del usuario como JSON. */
export async function GET() {
  try {
    const userId = await requireUserId();
    const [recipes, collections, shopping, planner] = await Promise.all([
      prisma.recipe.findMany({
        where: { userId },
        include: {
          ingredients: true,
          steps: true,
          notes: true,
          tags: { include: { tag: true } },
          collections: { include: { collection: true } },
        },
      }),
      prisma.collection.findMany({ where: { userId } }),
      prisma.shoppingListItem.findMany({ where: { userId } }),
      prisma.mealPlanEntry.findMany({ where: { userId } }),
    ]);

    const payload = {
      version: 1,
      exportedAt: new Date().toISOString(),
      recipes,
      collections,
      shopping,
      planner,
    };

    return new Response(JSON.stringify(payload, null, 2), {
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="mi-recetario-backup-${Date.now()}.json"`,
      },
    });
  } catch (err) {
    return handleError(err);
  }
}

/** Importa recetas desde un backup JSON (no borra lo existente). */
export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const data = await req.json();
    const recipes = Array.isArray(data?.recipes) ? data.recipes : [];
    let imported = 0;

    for (const r of recipes) {
      await prisma.recipe.create({
        data: {
          userId,
          title: r.title ?? "Receta importada",
          description: r.description ?? null,
          imageUrl: r.imageUrl ?? null,
          videoUrl: r.videoUrl ?? null,
          author: r.author ?? null,
          sourceUrl: r.sourceUrl ?? "importado",
          sourceType: r.sourceType ?? "manual",
          totalMinutes: r.totalMinutes ?? null,
          servings: r.servings ?? null,
          difficulty: r.difficulty ?? null,
          mealType: r.mealType ?? null,
          rating: r.rating ?? null,
          isFavorite: r.isFavorite ?? false,
          aiSummary: r.aiSummary ?? null,
          ingredients: {
            create: (r.ingredients ?? []).map(
              (i: { name: string; quantity?: string; unit?: string }, idx: number) => ({
                name: i.name,
                quantity: i.quantity ?? null,
                unit: i.unit ?? null,
                position: idx,
              }),
            ),
          },
          steps: {
            create: (r.steps ?? []).map(
              (s: { content: string }, idx: number) => ({
                content: typeof s === "string" ? s : s.content,
                position: idx,
              }),
            ),
          },
        },
      });
      imported++;
    }

    return ok({ imported });
  } catch (err) {
    return handleError(err);
  }
}
