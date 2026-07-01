"use client";
import Link from "next/link";
import { useState } from "react";
import { motion } from "motion/react";
import { Heart, Clock, Star, Flame, ImageOff } from "lucide-react";
import { cn, formatMinutes } from "@/lib/utils";
import { api } from "@/lib/api-client";
import type { Recipe } from "@/types";

export function RecipeCard({
  recipe,
  variant = "grid",
}: {
  recipe: Recipe;
  variant?: "grid" | "poster";
}) {
  const [fav, setFav] = useState(recipe.isFavorite);

  async function toggleFav(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    const next = !fav;
    setFav(next);
    try {
      await api.patch(`/api/recipes/${recipe.id}`, { isFavorite: next });
    } catch {
      setFav(!next);
    }
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 300, damping: 24 }}
      className={cn("group", variant === "poster" && "w-40 shrink-0 sm:w-48")}
    >
      <Link
        href={`/recetas/${recipe.id}`}
        className="block overflow-hidden rounded-2xl border border-border bg-surface"
      >
        <div
          className={cn(
            "relative overflow-hidden bg-surface-2",
            variant === "poster" ? "aspect-[3/4]" : "aspect-[4/3]",
          )}
        >
          {recipe.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              loading="lazy"
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-subtle">
              <ImageOff className="size-8" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />

          <button
            onClick={toggleFav}
            className="absolute right-2 top-2 flex size-8 items-center justify-center rounded-full bg-black/40 backdrop-blur transition-transform hover:scale-110"
            aria-label="Favorito"
          >
            <Heart
              className={cn(
                "size-4 transition-colors",
                fav ? "fill-rose-500 text-rose-500" : "text-white",
              )}
            />
          </button>

          {recipe.rating ? (
            <div className="absolute left-2 top-2 flex items-center gap-0.5 rounded-full bg-black/40 px-2 py-0.5 text-xs font-medium text-white backdrop-blur">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {recipe.rating}
            </div>
          ) : null}

          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-white">
              {recipe.title}
            </h3>
            <div className="mt-1 flex items-center gap-3 text-[11px] text-white/70">
              {recipe.totalMinutes ? (
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {formatMinutes(recipe.totalMinutes)}
                </span>
              ) : null}
              {recipe.timesCooked ? (
                <span className="flex items-center gap-1">
                  <Flame className="size-3" />
                  {recipe.timesCooked}×
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
