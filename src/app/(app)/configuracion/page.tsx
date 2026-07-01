import { requireUserId } from "@/lib/session";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SettingsPanel } from "@/components/settings-panel";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const userId = await requireUserId();
  const session = await auth();
  const [recipes, collections, cooked] = await Promise.all([
    prisma.recipe.count({ where: { userId } }),
    prisma.collection.count({ where: { userId } }),
    prisma.cookLog.count({ where: { recipe: { userId } } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Configuración</h1>
      <SettingsPanel
        name={session?.user?.name ?? ""}
        email={session?.user?.email ?? ""}
        stats={{ recipes, collections, cooked }}
      />
    </div>
  );
}
