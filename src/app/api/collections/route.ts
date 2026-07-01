import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, ok } from "@/lib/api";
import { collectionSchema } from "@/lib/validators";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const userId = await requireUserId();
    const collections = await prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      include: { _count: { select: { recipes: true } } },
    });
    return ok(collections);
  } catch (err) {
    return handleError(err);
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId();
    const input = collectionSchema.parse(await req.json());
    const collection = await prisma.collection.create({
      data: { ...input, userId },
    });
    return ok(collection, { status: 201 });
  } catch (err) {
    return handleError(err);
  }
}
