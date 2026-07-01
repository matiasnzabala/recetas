import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, notFound, ok } from "@/lib/api";
import { prisma } from "@/lib/prisma";
import { extractRecipe } from "@/services/ai";

type Params = { params: Promise<{ id: string }> };

/** Re-procesa una receta con IA a partir de su descripción/título. */
export async function POST(_req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const recipe = await prisma.recipe.findFirst({ where: { id, userId } });
    if (!recipe) return notFound();

    const text = [recipe.title, recipe.description].filter(Boolean).join("\n");
    const extraction = await extractRecipe(text, { title: recipe.title });

    if (extraction.ingredients.length) {
      await prisma.ingredient.deleteMany({ where: { recipeId: id } });
      await prisma.ingredient.createMany({
        data: extraction.ingredients.map((ing, i) => ({
          recipeId: id,
          name: ing.name,
          quantity: ing.quantity || null,
          unit: ing.unit || null,
          position: i,
        })),
      });
    }
    if (extraction.steps.length) {
      await prisma.step.deleteMany({ where: { recipeId: id } });
      await prisma.step.createMany({
        data: extraction.steps.map((content, i) => ({
          recipeId: id,
          content,
          position: i,
        })),
      });
    }

    const updated = await prisma.recipe.update({
      where: { id },
      data: {
        aiSummary: extraction.summary ?? recipe.aiSummary,
        mealType: extraction.mealType ?? recipe.mealType,
        difficulty: extraction.difficulty ?? recipe.difficulty,
        totalMinutes: extraction.totalMinutes ?? recipe.totalMinutes,
        servings: extraction.servings ?? recipe.servings,
        aiProcessed: true,
      },
    });
    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}
