import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, ok } from "@/lib/api";
import { recipeCreateSchema } from "@/lib/validators";
import { createRecipe, listRecipes } from "@/lib/data/recipes";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const sp = req.nextUrl.searchParams;
    const recipes = await listRecipes(userId, {
      q: sp.get("q") || undefined,
      status: sp.get("status") || undefined,
      mealType: sp.get("mealType") || undefined,
      favorite: sp.get("favorite") === "true" || undefined,
      collectionId: sp.get("collectionId") || undefined,
      tag: sp.get("tag") || undefined,
      author: sp.get("author") || undefined,
      maxMinutes: sp.get("maxMinutes")
        ? Number(sp.get("maxMinutes"))
        : undefined,
      sort: (sp.get("sort") as "recent" | "rating" | "cooked" | "title") || undefined,
    });
    return ok(recipes);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const body = await req.json();
    const input = recipeCreateSchema.parse(body);
    const recipe = await createRecipe(userId, input);
    return ok(recipe, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
