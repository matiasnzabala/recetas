import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, notFound, ok } from "@/lib/api";
import { logCooked } from "@/lib/data/recipes";

type Params = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Params) {
  try {
    const userId = await requireUserId();
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const recipe = await logCooked(userId, id, body?.note);
    if (!recipe) return notFound();
    return ok(recipe);
  } catch (err) {
    return handleError(err);
  }
}
