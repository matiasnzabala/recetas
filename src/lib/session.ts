import { auth } from "@/auth";

/**
 * Devuelve el id del usuario logueado o lanza. Usar en rutas/servidores
 * que ya están protegidos por el middleware.
 */
export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("UNAUTHORIZED");
  }
  return session.user.id;
}

export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
