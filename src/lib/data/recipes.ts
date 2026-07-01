import { prisma } from "@/lib/prisma";
import type { Prisma, RecipeStatus } from "@prisma/client";
import type { RecipeCreateInput, RecipeUpdateInput } from "@/lib/validators";

const recipeInclude = {
  ingredients: { orderBy: { position: "asc" } },
  steps: { orderBy: { position: "asc" } },
  notes: { orderBy: { createdAt: "desc" } },
  tags: { include: { tag: true } },
  collections: { include: { collection: true } },
} satisfies Prisma.RecipeInclude;

export type RecipeWithRelations = Prisma.RecipeGetPayload<{
  include: typeof recipeInclude;
}>;

async function upsertTags(tagNames: string[]): Promise<string[]> {
  const ids: string[] = [];
  for (const raw of tagNames) {
    const name = raw.trim().toLowerCase();
    if (!name) continue;
    const tag = await prisma.tag.upsert({
      where: { name },
      create: { name },
      update: {},
    });
    ids.push(tag.id);
  }
  return ids;
}

export async function createRecipe(
  userId: string,
  input: RecipeCreateInput,
): Promise<RecipeWithRelations> {
  const tagIds = await upsertTags(input.tags ?? []);

  return prisma.recipe.create({
    data: {
      userId,
      title: input.title,
      description: input.description || null,
      imageUrl: input.imageUrl || null,
      videoUrl: input.videoUrl || null,
      author: input.author || null,
      sourceUrl: input.sourceUrl,
      sourceType: input.sourceType || "instagram",
      prepMinutes: input.prepMinutes ?? null,
      cookMinutes: input.cookMinutes ?? null,
      totalMinutes: input.totalMinutes ?? null,
      servings: input.servings ?? null,
      difficulty: input.difficulty ?? null,
      mealType: input.mealType ?? null,
      status: (input.status as RecipeStatus) ?? "WANT_TO_COOK",
      rating: input.rating ?? null,
      isFavorite: input.isFavorite ?? false,
      aiSummary: input.summary ?? null,
      ingredients: {
        create: (input.ingredients ?? []).map((ing, i) => ({
          name: ing.name,
          quantity: ing.quantity || null,
          unit: ing.unit || null,
          position: i,
        })),
      },
      steps: {
        create: (input.steps ?? []).map((content, i) => ({
          content,
          position: i,
        })),
      },
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
      collections: {
        create: (input.collectionIds ?? []).map((collectionId) => ({
          collectionId,
        })),
      },
    },
    include: recipeInclude,
  });
}

export async function updateRecipe(
  userId: string,
  id: string,
  input: RecipeUpdateInput,
): Promise<RecipeWithRelations | null> {
  const existing = await prisma.recipe.findFirst({ where: { id, userId } });
  if (!existing) return null;

  // Reemplazo total de colecciones nested si vienen definidas.
  const data: Prisma.RecipeUpdateInput = {
    title: input.title,
    description: input.description,
    imageUrl: input.imageUrl || null,
    videoUrl: input.videoUrl || null,
    author: input.author,
    sourceUrl: input.sourceUrl,
    sourceType: input.sourceType,
    prepMinutes: input.prepMinutes,
    cookMinutes: input.cookMinutes,
    totalMinutes: input.totalMinutes,
    servings: input.servings,
    difficulty: input.difficulty,
    mealType: input.mealType,
    status: input.status as RecipeStatus | undefined,
    rating: input.rating,
    isFavorite: input.isFavorite,
    aiSummary: input.summary,
  };

  if (input.rating != null && input.rating !== existing.rating) {
    data.ratedAt = new Date();
  }

  if (input.ingredients) {
    await prisma.ingredient.deleteMany({ where: { recipeId: id } });
    data.ingredients = {
      create: input.ingredients.map((ing, i) => ({
        name: ing.name,
        quantity: ing.quantity || null,
        unit: ing.unit || null,
        position: i,
      })),
    };
  }

  if (input.steps) {
    await prisma.step.deleteMany({ where: { recipeId: id } });
    data.steps = {
      create: input.steps.map((content, i) => ({ content, position: i })),
    };
  }

  if (input.tags) {
    const tagIds = await upsertTags(input.tags);
    await prisma.tagsOnRecipes.deleteMany({ where: { recipeId: id } });
    data.tags = { create: tagIds.map((tagId) => ({ tagId })) };
  }

  if (input.collectionIds) {
    await prisma.recipesOnCollections.deleteMany({ where: { recipeId: id } });
    data.collections = {
      create: input.collectionIds.map((collectionId) => ({ collectionId })),
    };
  }

  return prisma.recipe.update({
    where: { id },
    data,
    include: recipeInclude,
  });
}

export async function deleteRecipe(userId: string, id: string) {
  const existing = await prisma.recipe.findFirst({ where: { id, userId } });
  if (!existing) return false;
  await prisma.recipe.delete({ where: { id } });
  return true;
}

export async function getRecipe(
  userId: string,
  id: string,
): Promise<RecipeWithRelations | null> {
  return prisma.recipe.findFirst({
    where: { id, userId },
    include: recipeInclude,
  });
}

/** Registra que se cocinó (historial + contador + fecha). */
export async function logCooked(userId: string, id: string, note?: string) {
  const recipe = await prisma.recipe.findFirst({ where: { id, userId } });
  if (!recipe) return null;
  await prisma.cookLog.create({ data: { recipeId: id, note: note || null } });
  return prisma.recipe.update({
    where: { id },
    data: {
      timesCooked: { increment: 1 },
      lastCookedAt: new Date(),
      status: recipe.status === "WANT_TO_COOK" ? "COOKED" : recipe.status,
    },
  });
}

export interface RecipeFilters {
  q?: string;
  status?: string;
  mealType?: string;
  favorite?: boolean;
  collectionId?: string;
  tag?: string;
  author?: string;
  maxMinutes?: number;
  sort?: "recent" | "rating" | "cooked" | "title";
}

export async function listRecipes(userId: string, filters: RecipeFilters = {}) {
  const where: Prisma.RecipeWhereInput = { userId };

  if (filters.q) {
    const q = filters.q;
    where.OR = [
      { title: { contains: q } },
      { description: { contains: q } },
      { author: { contains: q } },
      { ingredients: { some: { name: { contains: q } } } },
      { tags: { some: { tag: { name: { contains: q } } } } },
    ];
  }
  if (filters.status) where.status = filters.status as RecipeStatus;
  if (filters.mealType) where.mealType = filters.mealType;
  if (filters.favorite) where.isFavorite = true;
  if (filters.author) where.author = { contains: filters.author };
  if (filters.maxMinutes) where.totalMinutes = { lte: filters.maxMinutes };
  if (filters.collectionId)
    where.collections = { some: { collectionId: filters.collectionId } };
  if (filters.tag)
    where.tags = { some: { tag: { name: filters.tag.toLowerCase() } } };

  let orderBy: Prisma.RecipeOrderByWithRelationInput = { createdAt: "desc" };
  if (filters.sort === "rating") orderBy = { rating: "desc" };
  else if (filters.sort === "cooked") orderBy = { timesCooked: "desc" };
  else if (filters.sort === "title") orderBy = { title: "asc" };

  return prisma.recipe.findMany({
    where,
    orderBy,
    include: {
      tags: { include: { tag: true } },
    },
  });
}

export type RecipeCard = Awaited<ReturnType<typeof listRecipes>>[number];
