import { z } from "zod";

export const ingredientSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
});

export const recipeCreateSchema = z.object({
  title: z.string().min(1, "El título es obligatorio"),
  description: z.string().optional().nullable(),
  imageUrl: z.string().url().optional().nullable().or(z.literal("")),
  videoUrl: z.string().url().optional().nullable().or(z.literal("")),
  author: z.string().optional().nullable(),
  sourceUrl: z.string().min(1),
  sourceType: z.string().optional(),
  prepMinutes: z.number().int().positive().optional().nullable(),
  cookMinutes: z.number().int().positive().optional().nullable(),
  totalMinutes: z.number().int().positive().optional().nullable(),
  servings: z.number().int().positive().optional().nullable(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().nullable(),
  mealType: z.string().optional().nullable(),
  status: z
    .enum(["WANT_TO_COOK", "COOKED", "EXCELLENT", "DISLIKED"])
    .optional(),
  rating: z.number().int().min(1).max(5).optional().nullable(),
  isFavorite: z.boolean().optional(),
  summary: z.string().optional().nullable(),
  ingredients: z.array(ingredientSchema).optional(),
  steps: z.array(z.string().min(1)).optional(),
  tags: z.array(z.string().min(1)).optional(),
  collectionIds: z.array(z.string()).optional(),
});

export const recipeUpdateSchema = recipeCreateSchema.partial();

export const importSchema = z.object({
  url: z.string().min(3),
});

export const collectionSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional().nullable(),
  emoji: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  coverUrl: z.string().optional().nullable(),
});

export const noteSchema = z.object({
  content: z.string().min(1),
});

export const mealPlanSchema = z.object({
  recipeId: z.string().min(1),
  date: z.string().min(1),
  meal: z.string().optional(),
});

export const shoppingGenerateSchema = z.object({
  recipeIds: z.array(z.string()).min(1),
});

export const shoppingItemSchema = z.object({
  name: z.string().min(1),
  quantity: z.string().optional().nullable(),
  unit: z.string().optional().nullable(),
});

export type RecipeCreateInput = z.infer<typeof recipeCreateSchema>;
export type RecipeUpdateInput = z.infer<typeof recipeUpdateSchema>;
