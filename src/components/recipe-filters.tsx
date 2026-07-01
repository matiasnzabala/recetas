"use client";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { cn, STATUS_LABELS } from "@/lib/utils";

const STATUSES = ["WANT_TO_COOK", "COOKED", "EXCELLENT", "DISLIKED"] as const;
const SORTS = [
  { key: "recent", label: "Recientes" },
  { key: "rating", label: "Mejor puntuadas" },
  { key: "cooked", label: "Más cocinadas" },
  { key: "title", label: "A–Z" },
];

export function RecipeFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();

  const status = sp.get("status");
  const favorite = sp.get("favorite") === "true";
  const sort = sp.get("sort") || "recent";

  function update(key: string, value: string | null) {
    const params = new URLSearchParams(sp.toString());
    if (value === null || params.get(key) === value) params.delete(key);
    else params.set(key, value);
    router.push(`${pathname}?${params.toString()}`);
  }

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap",
      active
        ? "border-primary/50 bg-primary/15 text-primary"
        : "border-border bg-surface-2 text-muted hover:text-foreground",
    );

  return (
    <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <button
        className={chip(favorite)}
        onClick={() => update("favorite", favorite ? null : "true")}
      >
        ❤️ Favoritas
      </button>
      {STATUSES.map((s) => (
        <button
          key={s}
          className={chip(status === s)}
          onClick={() => update("status", s)}
        >
          {STATUS_LABELS[s]}
        </button>
      ))}
      <span className="mx-1 w-px shrink-0 bg-border" />
      {SORTS.map((s) => (
        <button
          key={s.key}
          className={chip(sort === s.key)}
          onClick={() => update("sort", s.key)}
        >
          {s.label}
        </button>
      ))}
    </div>
  );
}
