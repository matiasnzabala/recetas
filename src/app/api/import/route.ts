import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, ok } from "@/lib/api";
import { importSchema } from "@/lib/validators";
import { importFromUrl } from "@/services/recipe-import";

/**
 * Analiza una URL (Instagram u otra) y devuelve un borrador de receta.
 * No persiste nada — el cliente revisa/edita y luego hace POST /api/recipes.
 */
export async function POST(req: NextRequest) {
  try {
    await requireUserId();
    const { url } = importSchema.parse(await req.json());
    const draft = await importFromUrl(url);
    return ok(draft);
  } catch (err) {
    return handleError(err);
  }
}
