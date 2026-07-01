import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, notFound, ok, badRequest } from "@/lib/api";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

async function assertOwnership(userId: string, collectionId: string) {
  return prisma.collection.findFirst({ where: { id: collectionId, userId } });
}

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    if (!(await assertOwnership(userId, id))) return notFound();
    const { recipeId } = await req.json();
    if (!recipeId) return badRequest("recipeId requerido");
    const recipe = await prisma.recipe.findFirst({
      where: { id: recipeId, userId },
    });
    if (!recipe) return notFound("Receta no encontrada");
    await prisma.recipesOnCollections.upsert({
      where: { recipeId_collectionId: { recipeId, collectionId: id } },
      create: { recipeId, collectionId: id },
      update: {},
    });
    return ok({ added: true });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    if (!(await assertOwnership(userId, id))) return notFound();
    const recipeId = req.nextUrl.searchParams.get("recipeId");
    if (!recipeId) return badRequest("recipeId requerido");
    await prisma.recipesOnCollections.deleteMany({
      where: { recipeId, collectionId: id },
    });
    return ok({ removed: true });
  } catch (err) {
    return handleError(err);
  }
}
