import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, ok } from "@/lib/api";
import { shoppingGenerateSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { consolidateIngredients } from "@/services/shopping";

/**
 * Genera la lista de compras consolidada a partir de varias recetas.
 * Reemplaza los ítems auto-generados previos (no borra los agregados a mano).
 */
export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const { recipeIds } = shoppingGenerateSchema.parse(await req.json());

    const ingredients = await prisma.ingredient.findMany({
      where: { recipe: { id: { in: recipeIds }, userId } },
    });

    const consolidated = consolidateIngredients(ingredients);

    // Limpia ítems auto-generados anteriores (los que tienen recipeId no null)
    await prisma.shoppingListItem.deleteMany({
      where: { userId, recipeId: { not: null } },
    });

    if (consolidated.length > 0) {
      await prisma.shoppingListItem.createMany({
        data: consolidated.map((c) => ({
          userId,
          name: c.name,
          quantity: c.quantity || null,
          unit: c.unit || null,
          recipeId: recipeIds[0], // marca de origen para poder regenerar
        })),
      });
    }

    const items = await prisma.shoppingListItem.findMany({
      where: { userId },
      orderBy: [{ checked: "asc" }, { name: "asc" }],
    });
    return ok(items);
  } catch (err) {
    return handleError(err);
  }
}
