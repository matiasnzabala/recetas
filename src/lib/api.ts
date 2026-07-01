import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { requireUserId } from "@/lib/session";

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json(data, init);
}

export function badRequest(message: string, details?: unknown) {
  return NextResponse.json({ error: message, details }, { status: 400 });
}

export function notFound(message = "No encontrado") {
  return NextResponse.json({ error: message }, { status: 404 });
}

export function unauthorized() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 });
}

/**
 * Envuelve un handler protegido: resuelve el userId y captura errores comunes
 * (zod, auth) devolviendo respuestas JSON consistentes.
 */
export function withUser<T>(
  handler: (userId: string) => Promise<NextResponse<T> | Response>,
) {
  return async () => {
    try {
      const userId = await requireUserId();
      return await handler(userId);
    } catch (err) {
      return handleError(err);
    }
  };
}

export function handleError(err: unknown) {
  if (err instanceof ZodError) {
    return badRequest("Datos inválidos", err.flatten());
  }
  if (err instanceof Error && err.message === "UNAUTHORIZED") {
    return unauthorized();
  }
  console.error("[api] error:", err);
  return NextResponse.json(
    { error: "Error interno del servidor" },
    { status: 500 },
  );
}
