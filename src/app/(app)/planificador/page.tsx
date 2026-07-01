import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { PlannerBoard } from "@/components/planner-board";

export const dynamic = "force-dynamic";

export default async function PlannerPage() {
  const userId = await requireUserId();
  const recipes = await prisma.recipe.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    select: { id: true, title: true, imageUrl: true, totalMinutes: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Planificador</h1>
        <p className="text-sm text-muted">
          Arrastrá recetas a cada día de la semana.
        </p>
      </div>
      <PlannerBoard recipes={recipes} />
    </div>
  );
}
