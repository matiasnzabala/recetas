import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

// Next.js 16: convención "proxy" (reemplaza a middleware).
// Auth.js expone el wrapper `auth` que protege las rutas según authConfig.
const { auth } = NextAuth(authConfig);

export default auth;

export const config = {
  // Protege todo salvo estáticos, assets y las rutas de auth.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|icon.svg|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)",
  ],
};
