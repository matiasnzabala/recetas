import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, ok } from "@/lib/api";
import { shoppingItemSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userId = await requireUserId();
    const items = await prisma.shoppingListItem.findMany({
      where: { userId },
      orderBy: [{ checked: "asc" }, { name: "asc" }],
    });
    return ok(items);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const input = shoppingItemSchema.parse(await req.json());
    const item = await prisma.shoppingListItem.create({
      data: {
        userId,
        name: input.name,
        quantity: input.quantity || null,
        unit: input.unit || null,
      },
    });
    return ok(item, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const { id, checked } = await req.json();
    const item = await prisma.shoppingListItem.findFirst({
      where: { id, userId },
    });
    if (!item) return ok({ error: "no encontrado" }, { status: 404 });
    const updated = await prisma.shoppingListItem.update({
      where: { id },
      data: { checked: Boolean(checked) },
    });
    return ok(updated);
  } catch (err) {
    return handleError(err);
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const id = req.nextUrl.searchParams.get("id");
    if (id === "checked") {
      await prisma.shoppingListItem.deleteMany({
        where: { userId, checked: true },
      });
      return ok({ cleared: true });
    }
    if (id === "all") {
      await prisma.shoppingListItem.deleteMany({ where: { userId } });
      return ok({ cleared: true });
    }
    if (id) {
      await prisma.shoppingListItem.deleteMany({ where: { id, userId } });
    }
    return ok({ deleted: true });
  } catch (err) {
    return handleError(err);
  }
}
