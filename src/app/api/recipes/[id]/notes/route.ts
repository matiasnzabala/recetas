import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, notFound, ok } from "@/lib/api";
import { noteSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const recipe = await prisma.recipe.findFirst({ where: { id, userId } });
    if (!recipe) return notFound();
    const { content } = noteSchema.parse(await req.json());
    const note = await prisma.note.create({
      data: { recipeId: id, content },
    });
    return ok(note, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const noteId = req.nextUrl.searchParams.get("noteId");
    if (!noteId) return notFound();
    // Verifica ownership vía la receta
    const note = await prisma.note.findFirst({
      where: { id: noteId, recipe: { id, userId } },
    });
    if (!note) return notFound();
    await prisma.note.delete({ where: { id: noteId } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
