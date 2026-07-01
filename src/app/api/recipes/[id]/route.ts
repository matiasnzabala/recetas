import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, notFound, ok } from "@/lib/api";
import { recipeUpdateSchema } from "@/lib/validators";
import { deleteRecipe, getRecipe, updateRecipe } from "@/lib/data/recipes";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const recipe = await getRecipe(userId, id);
    if (!recipe) return notFound();
    return ok(recipe);
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const input = recipeUpdateSchema.parse(await req.json());
    const recipe = await updateRecipe(userId, id, input);
    if (!recipe) return notFound();
    return ok(recipe);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const okDeleted = await deleteRecipe(userId, id);
    if (!okDeleted) return notFound();
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
