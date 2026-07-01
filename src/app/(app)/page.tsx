import Link from "next/link";
import {
  Sparkles,
  Clock,
  Heart,
  Flame,
  BookMarked,
  Plus,
  CalendarDays,
  ShoppingCart,
  FolderHeart,
  ChefHat,
} from "lucide-react";
import { requireUserId } from "@/lib/session";
import { getDashboardData } from "@/lib/data/dashboard";
import { SearchBar } from "@/components/search-bar";
import { RecipeRow } from "@/components/recipe-row";
import { CollectionCard } from "@/components/collection-card";
import { EmptyState } from "@/components/empty-state";
import type { Recipe } from "@/types";

export const dynamic = "force-dynamic";

const QUICK = [
  { href: "/agregar", label: "Agregar", icon: Plus, color: "from-primary to-accent" },
  { href: "/planificador", label: "Planner", icon: CalendarDays, color: "from-sky-500 to-indigo-500" },
  { href: "/compras", label: "Compras", icon: ShoppingCart, color: "from-emerald-500 to-teal-500" },
  { href: "/colecciones", label: "Colecciones", icon: FolderHeart, color: "from-fuchsia-500 to-pink-500" },
];

export default async function DashboardPage() {
  const userId = await requireUserId();
  const data = await getDashboardData(userId);
  const recipes = data as unknown as {
    latest: Recipe[];
    favorites: Recipe[];
    mostCooked: Recipe[];
    pending: Recipe[];
    wantToCook: Recipe[];
    collections: import("@/types").Collection[];
    total: number;
  };

  const empty = recipes.total === 0;

  return (
    <div className="space-y-8">
      <header className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted">Bienvenido de vuelta 👋</p>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              ¿Qué cocinamos hoy?
            </h1>
          </div>
        </div>
        <SearchBar />
      </header>

      {/* Accesos rápidos */}
      <div className="grid grid-cols-4 gap-3">
        {QUICK.map(({ href, label, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-surface p-3 transition-all hover:-translate-y-0.5 hover:border-primary/30"
          >
            <span
              className={`flex size-11 items-center justify-center rounded-xl bg-gradient-to-br ${color} text-white`}
            >
              <Icon className="size-5" />
            </span>
            <span className="text-[11px] font-medium text-muted sm:text-xs">
              {label}
            </span>
          </Link>
        ))}
      </div>

      {empty ? (
        <EmptyState
          icon={ChefHat}
          title="Tu recetario está vacío"
          description="Pegá el link de una receta de Instagram y armá tu biblioteca personal."
          actionLabel="Agregar primera receta"
          actionHref="/agregar"
        />
      ) : (
        <div className="space-y-9">
          <RecipeRow
            title="Continuar cocinando"
            icon={Sparkles}
            recipes={recipes.pending}
            href="/recetas?status=WANT_TO_COOK"
          />
          <RecipeRow
            title="Últimas recetas"
            icon={Clock}
            recipes={recipes.latest}
            href="/recetas"
          />
          <RecipeRow
            title="Favoritas"
            icon={Heart}
            recipes={recipes.favorites}
            href="/recetas?favorite=true"
          />
          <RecipeRow
            title="Lo más cocinado"
            icon={Flame}
            recipes={recipes.mostCooked}
            href="/recetas?sort=cooked"
          />

          {recipes.collections.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <FolderHeart className="size-5 text-primary" />
                Colecciones
              </h2>
              <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-4">
                {recipes.collections.map((c) => (
                  <div key={c.id} className="w-40 sm:w-auto">
                    <CollectionCard collection={c} />
                  </div>
                ))}
              </div>
            </section>
          )}

          {recipes.pending.length > 0 && (
            <RecipeRow
              title="Pendientes"
              icon={BookMarked}
              recipes={recipes.wantToCook}
              href="/recetas?status=WANT_TO_COOK"
            />
          )}
        </div>
      )}
    </div>
  );
}
