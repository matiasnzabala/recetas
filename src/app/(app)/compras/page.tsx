import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { ShoppingList } from "@/components/shopping-list";
import type { ShoppingItem } from "@/types";

export const dynamic = "force-dynamic";

export default async function ShoppingPage() {
  const userId = await requireUserId();
  const [items, recipes] = await Promise.all([
    prisma.shoppingListItem.findMany({
      where: { userId },
      orderBy: [{ checked: "asc" }, { name: "asc" }],
    }),
    prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      select: { id: true, title: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Lista de compras</h1>
        <p className="text-sm text-muted">
          Consolidada automáticamente, sin duplicados.
        </p>
      </div>
      <ShoppingList
        initial={items as unknown as ShoppingItem[]}
        recipes={recipes}
      />
    </div>
  );
}
