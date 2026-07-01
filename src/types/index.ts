export type RecipeStatus =
  | "WANT_TO_COOK"
  | "COOKED"
  | "EXCELLENT"
  | "DISLIKED";

export interface Ingredient {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  position: number;
}

export interface Step {
  id: string;
  content: string;
  position: number;
}

export interface Note {
  id: string;
  content: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string | null;
}

export interface TagLink {
  tag: Tag;
}

export interface CollectionLink {
  collection: Collection;
}

export interface Recipe {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
  author: string | null;
  sourceUrl: string;
  sourceType: string;
  prepMinutes: number | null;
  cookMinutes: number | null;
  totalMinutes: number | null;
  servings: number | null;
  difficulty: string | null;
  mealType: string | null;
  status: RecipeStatus;
  rating: number | null;
  isFavorite: boolean;
  aiSummary: string | null;
  timesCooked: number | null;
  lastCookedAt: string | null;
  createdAt: string;
  updatedAt: string;
  ingredients?: Ingredient[];
  steps?: Step[];
  notes?: Note[];
  tags?: TagLink[];
  collections?: CollectionLink[];
}

export interface Collection {
  id: string;
  name: string;
  description: string | null;
  emoji: string | null;
  color: string | null;
  coverUrl: string | null;
  createdAt: string;
  _count?: { recipes: number };
}

export interface MealPlanEntry {
  id: string;
  date: string;
  meal: string;
  recipe: {
    id: string;
    title: string;
    imageUrl: string | null;
    totalMinutes: number | null;
  };
}

export interface ShoppingItem {
  id: string;
  name: string;
  quantity: string | null;
  unit: string | null;
  checked: boolean;
  recipeId: string | null;
}

export interface RecipeDraft {
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  author?: string;
  sourceUrl: string;
  sourceType: string;
  summary?: string;
  ingredients: { name: string; quantity?: string; unit?: string }[];
  steps: string[];
  mealType?: string;
  difficulty?: string;
  totalMinutes?: number;
  servings?: number;
  tags: string[];
  aiProcessed: boolean;
}
