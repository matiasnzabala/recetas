import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, notFound, ok } from "@/lib/api";
import { collectionSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

type Params = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const existing = await prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!existing) return notFound();
    const input = collectionSchema.partial().parse(await req.json());
    const collection = await prisma.collection.update({
      where: { id },
      data: input,
    });
    return ok(collection);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const existing = await prisma.collection.findFirst({
      where: { id, userId },
    });
    if (!existing) return notFound();
    await prisma.collection.delete({ where: { id } });
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
