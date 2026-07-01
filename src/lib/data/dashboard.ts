import { prisma } from "@/lib/prisma";

const cardInclude = { tags: { include: { tag: true } } };

export async function getDashboardData(userId: string) {
  const [
    latest,
    favorites,
    mostCooked,
    pending,
    wantToCook,
    collections,
    counts,
  ] = await Promise.all([
    prisma.recipe.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: cardInclude,
    }),
    prisma.recipe.findMany({
      where: { userId, isFavorite: true },
      orderBy: { updatedAt: "desc" },
      take: 12,
      include: cardInclude,
    }),
    prisma.recipe.findMany({
      where: { userId, timesCooked: { gt: 0 } },
      orderBy: { timesCooked: "desc" },
      take: 12,
      include: cardInclude,
    }),
    prisma.recipe.findMany({
      where: { userId, status: "WANT_TO_COOK" },
      orderBy: { createdAt: "desc" },
      take: 12,
      include: cardInclude,
    }),
    prisma.recipe.findMany({
      where: { userId, status: "WANT_TO_COOK", lastCookedAt: null },
      orderBy: { updatedAt: "desc" },
      take: 6,
      include: cardInclude,
    }),
    prisma.collection.findMany({
      where: { userId },
      orderBy: { createdAt: "asc" },
      take: 12,
      include: { _count: { select: { recipes: true } } },
    }),
    prisma.recipe.count({ where: { userId } }),
  ]);

  return {
    latest,
    favorites,
    mostCooked,
    pending,
    wantToCook,
    collections,
    total: counts,
  };
}
