/**
 * Orquestador de importación: dada una URL, obtiene metadatos (scraping) y
 * extrae estructura de la receta (IA o heurística). No toca la base de datos;
 * devuelve un "draft" listo para persistir o editar a mano.
 */
import { scrapeUrl, normalizeUrl } from "./instagram";
import { extractRecipe, type ParsedIngredient } from "./ai";

export interface RecipeDraft {
  title: string;
  description?: string;
  imageUrl?: string;
  videoUrl?: string;
  author?: string;
  sourceUrl: string;
  sourceType: string;
  summary?: string;
  ingredients: ParsedIngredient[];
  steps: string[];
  mealType?: string;
  difficulty?: string;
  totalMinutes?: number;
  servings?: number;
  tags: string[];
  aiProcessed: boolean;
}

export async function importFromUrl(inputUrl: string): Promise<RecipeDraft> {
  const sourceUrl = normalizeUrl(inputUrl);
  const meta = await scrapeUrl(sourceUrl);

  const textForAI = [meta.title, meta.description, meta.raw]
    .filter(Boolean)
    .join("\n");

  let extraction = {
    ingredients: [] as ParsedIngredient[],
    steps: [] as string[],
    tags: [] as string[],
  } as Awaited<ReturnType<typeof extractRecipe>>;

  let aiProcessed = false;
  if (textForAI.trim().length > 0) {
    extraction = await extractRecipe(textForAI, { title: meta.title });
    aiProcessed = true;
  }

  return {
    title: extraction.title || meta.title || "Receta sin título",
    description: meta.description,
    imageUrl: meta.imageUrl,
    videoUrl: meta.videoUrl,
    author: meta.author,
    sourceUrl,
    sourceType: meta.sourceType,
    summary: extraction.summary,
    ingredients: extraction.ingredients,
    steps: extraction.steps,
    mealType: extraction.mealType,
    difficulty: extraction.difficulty,
    totalMinutes: extraction.totalMinutes,
    servings: extraction.servings,
    tags: extraction.tags,
    aiProcessed,
  };
}
