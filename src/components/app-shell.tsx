"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  Home,
  BookOpen,
  FolderHeart,
  CalendarDays,
  ShoppingCart,
  Plus,
  Settings,
  ChefHat,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV = [
  { href: "/", label: "Inicio", icon: Home },
  { href: "/recetas", label: "Recetas", icon: BookOpen },
  { href: "/colecciones", label: "Colecciones", icon: FolderHeart },
  { href: "/planificador", label: "Planner", icon: CalendarDays },
  { href: "/compras", label: "Compras", icon: ShoppingCart },
];

export function AppShell({
  children,
  userName,
}: {
  children: React.ReactNode;
  userName?: string | null;
}) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <div className="flex min-h-dvh">
      {/* Sidebar desktop */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border p-5 lg:flex">
        <Link href="/" className="mb-8 flex items-center gap-2.5">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent">
            <ChefHat className="size-5 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight">Mi Recetario</span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                isActive(href)
                  ? "bg-surface-2 text-foreground"
                  : "text-muted hover:bg-surface-2/60 hover:text-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col gap-1 border-t border-border pt-4">
          <Link
            href="/configuracion"
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              isActive("/configuracion")
                ? "bg-surface-2 text-foreground"
                : "text-muted hover:bg-surface-2/60 hover:text-foreground",
            )}
          >
            <Settings className="size-5" />
            Configuración
          </Link>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-surface-2/60 hover:text-foreground"
          >
            <LogOut className="size-5" />
            Salir
          </button>
          {userName && (
            <p className="mt-2 px-3 text-xs text-subtle">Hola, {userName}</p>
          )}
        </div>
      </aside>

      {/* Contenido */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 lg:pb-10 lg:pt-10">
          {children}
        </main>
      </div>

      {/* FAB agregar (mobile) */}
      <Link href="/agregar" className="fixed bottom-24 right-5 z-40 lg:hidden">
        <Button
          size="icon"
          variant="gradient"
          className="size-14 rounded-full shadow-xl shadow-primary/30"
          aria-label="Agregar receta"
        >
          <Plus className="size-6" />
        </Button>
      </Link>

      {/* Bottom nav mobile */}
      <nav className="glass pb-safe fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border px-2 pt-2 lg:hidden">
        {NAV.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex flex-1 flex-col items-center gap-1 rounded-lg py-1.5 text-[10px] font-medium transition-colors",
              isActive(href) ? "text-primary" : "text-subtle",
            )}
          >
            <Icon className="size-5" />
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
