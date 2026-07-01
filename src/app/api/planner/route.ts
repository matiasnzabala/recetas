import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, notFound, ok } from "@/lib/api";
import { mealPlanSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";
import { startOfDay } from "@/lib/utils";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const sp = req.nextUrl.searchParams;
    const from = sp.get("from");
    const to = sp.get("to");
    const where: {
      userId: string;
      date?: { gte?: Date; lte?: Date };
    } = { userId };
    if (from || to) {
      where.date = {};
      if (from) where.date.gte = new Date(from);
      if (to) where.date.lte = new Date(to);
    }
    const entries = await prisma.mealPlanEntry.findMany({
      where,
      orderBy: [{ date: "asc" }, { position: "asc" }],
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            totalMinutes: true,
          },
        },
      },
    });
    return ok(entries);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const input = mealPlanSchema.parse(await req.json());
    const recipe = await prisma.recipe.findFirst({
      where: { id: input.recipeId, userId },
    });
    if (!recipe) return notFound("Receta no encontrada");
    const entry = await prisma.mealPlanEntry.create({
      data: {
        userId,
        recipeId: input.recipeId,
        date: startOfDay(new Date(input.date)),
        meal: input.meal || "cena",
      },
      include: {
        recipe: {
          select: {
            id: true,
            title: true,
            imageUrl: true,
            totalMinutes: true,
          },
        },
      },
    });
    return ok(entry, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const entryId = req.nextUrl.searchParams.get("entryId");
    if (!entryId) return notFound();
    const entry = await prisma.mealPlanEntry.findFirst({
      where: { id: entryId, userId },
    });
    if (!entry) return notFound();
    await prisma.mealPlanEntry.delete({ where: { id: entryId } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
