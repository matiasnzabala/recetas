import Link from "next/link";
import { ChevronRight, type LucideIcon } from "lucide-react";
import { RecipeCard } from "@/components/recipe-card";
import type { Recipe } from "@/types";

export function RecipeRow({
  title,
  icon: Icon,
  recipes,
  href,
}: {
  title: string;
  icon?: LucideIcon;
  recipes: Recipe[];
  href?: string;
}) {
  if (!recipes.length) return null;
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {Icon && <Icon className="size-5 text-primary" />}
          {title}
        </h2>
        {href && (
          <Link
            href={href}
            className="flex items-center gap-0.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            Ver todo <ChevronRight className="size-4" />
          </Link>
        )}
      </div>
      <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {recipes.map((r) => (
          <RecipeCard key={r.id} recipe={r} variant="poster" />
        ))}
      </div>
    </section>
  );
}
