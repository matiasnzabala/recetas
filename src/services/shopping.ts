import type { Ingredient } from "@prisma/client";

export interface ConsolidatedItem {
  name: string;
  quantity?: string;
  unit?: string;
  recipeId?: string;
}

/**
 * Consolida ingredientes de varias recetas en una lista sin duplicados.
 * Agrupa por (nombre normalizado + unidad). Si las cantidades son numéricas y
 * comparten unidad, las suma; si no, las concatena.
 */
export function consolidateIngredients(
  ingredients: Ingredient[],
): ConsolidatedItem[] {
  const map = new Map<string, ConsolidatedItem & { _numeric: number | null }>();

  for (const ing of ingredients) {
    const name = ing.name.trim();
    const unit = (ing.unit || "").trim().toLowerCase();
    const key = `${name.toLowerCase()}|${unit}`;
    const numeric = parseNumeric(ing.quantity);

    const existing = map.get(key);
    if (!existing) {
      map.set(key, {
        name,
        unit: ing.unit || undefined,
        quantity: ing.quantity || undefined,
        _numeric: numeric,
      });
    } else if (existing._numeric != null && numeric != null) {
      existing._numeric += numeric;
      existing.quantity = formatNumber(existing._numeric);
    } else if (ing.quantity) {
      existing.quantity = [existing.quantity, ing.quantity]
        .filter(Boolean)
        .join(" + ");
      existing._numeric = null;
    }
  }

  return [...map.values()]
    .map(({ _numeric, ...rest }) => {
      void _numeric;
      return rest;
    })
    .sort((a, b) => a.name.localeCompare(b.name, "es"));
}

function parseNumeric(q?: string | null): number | null {
  if (!q) return null;
  const trimmed = q.trim();
  // fracciones tipo 1/2
  const frac = trimmed.match(/^(\d+)\/(\d+)$/);
  if (frac) return parseInt(frac[1], 10) / parseInt(frac[2], 10);
  const n = parseFloat(trimmed.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function formatNumber(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2).replace(/\.?0+$/, "");
}
