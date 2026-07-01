import { requireUserId } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { CollectionsManager } from "@/components/collections-manager";
import type { Collection } from "@/types";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const userId = await requireUserId();
  const collections = await prisma.collection.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    include: { _count: { select: { recipes: true } } },
  });
  return <CollectionsManager initial={collections as unknown as Collection[]} />;
}
