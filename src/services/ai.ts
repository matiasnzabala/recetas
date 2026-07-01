/**
 * Capa de servicios de IA (OpenAI).
 *
 * Toda interacción con el modelo pasa por acá — el frontend nunca llama a
 * OpenAI directamente. Si no hay OPENAI_API_KEY configurada, las funciones
 * degradan a un parser heurístico local para no romper el flujo.
 *
 * Preparado para extenderse a un chat (ver `chat()` al final).
 */
import OpenAI from "openai";

export interface ParsedIngredient {
  name: string;
  quantity?: string;
  unit?: string;
  raw?: string;
}

export interface RecipeExtraction {
  title?: string;
  summary?: string;
  ingredients: ParsedIngredient[];
  steps: string[];
  mealType?: string;
  difficulty?: "easy" | "medium" | "hard";
  totalMinutes?: number;
  servings?: number;
  tags: string[];
}

const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

export function isAIEnabled(): boolean {
  return Boolean(process.env.OPENAI_API_KEY);
}

let _client: OpenAI | null = null;
function client(): OpenAI {
  if (!_client) {
    _client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return _client;
}

const SYSTEM_PROMPT = `Sos un asistente experto en cocina. Recibís el texto de una publicación
(descripción de Instagram o web) de una receta y devolvés SOLO un JSON válido con esta forma:
{
  "title": string,
  "summary": string breve (1-2 frases),
  "ingredients": [{ "name": string, "quantity": string|null, "unit": string|null }],
  "steps": [string],
  "mealType": "desayuno"|"almuerzo"|"merienda"|"cena"|"postre"|"snack",
  "difficulty": "easy"|"medium"|"hard",
  "totalMinutes": number|null,
  "servings": number|null,
  "tags": [string]
}
No inventes datos que no estén implícitos. Respondé en español. Solo el JSON, sin markdown.`;

export async function extractRecipe(
  text: string,
  hints?: { title?: string },
): Promise<RecipeExtraction> {
  if (!isAIEnabled()) {
    return heuristicExtract(text, hints);
  }

  try {
    const completion = await client().chat.completions.create({
      model: MODEL,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: `Título tentativo: ${hints?.title ?? "(desconocido)"}\n\nTexto:\n${text}`,
        },
      ],
    });
    const content = completion.choices[0]?.message?.content ?? "{}";
    const data = JSON.parse(content);
    return normalizeExtraction(data);
  } catch (err) {
    console.error("[ai] extractRecipe falló, uso heurística:", err);
    return heuristicExtract(text, hints);
  }
}

function normalizeExtraction(data: unknown): RecipeExtraction {
  const d = (data ?? {}) as Record<string, unknown>;
  const ingredients = Array.isArray(d.ingredients)
    ? (d.ingredients as unknown[]).map((i) => {
        const o = (i ?? {}) as Record<string, unknown>;
        return {
          name: String(o.name ?? "").trim(),
          quantity: o.quantity ? String(o.quantity) : undefined,
          unit: o.unit ? String(o.unit) : undefined,
        } as ParsedIngredient;
      }).filter((i) => i.name)
    : [];
  const steps = Array.isArray(d.steps)
    ? (d.steps as unknown[]).map((s) => String(s).trim()).filter(Boolean)
    : [];
  const tags = Array.isArray(d.tags)
    ? (d.tags as unknown[]).map((t) => String(t).trim().toLowerCase()).filter(Boolean)
    : [];
  const diff = String(d.difficulty ?? "");
  return {
    title: d.title ? String(d.title) : undefined,
    summary: d.summary ? String(d.summary) : undefined,
    ingredients,
    steps,
    mealType: d.mealType ? String(d.mealType) : undefined,
    difficulty: ["easy", "medium", "hard"].includes(diff)
      ? (diff as RecipeExtraction["difficulty"])
      : undefined,
    totalMinutes:
      typeof d.totalMinutes === "number" ? d.totalMinutes : undefined,
    servings: typeof d.servings === "number" ? d.servings : undefined,
    tags: [...new Set(tags)],
  };
}

// ---------------------------------------------------------------------------
// Fallback heurístico (sin IA) — parsea texto plano lo mejor posible.
// ---------------------------------------------------------------------------

const UNITS = [
  "g", "gr", "gramos", "kg", "kilo", "kilos", "ml", "l", "litro", "litros",
  "taza", "tazas", "cda", "cdas", "cucharada", "cucharadas", "cdta", "cdtas",
  "cucharadita", "cucharaditas", "pizca", "diente", "dientes", "unidad",
  "unidades", "puñado",
];

export function heuristicExtract(
  text: string,
  hints?: { title?: string },
): RecipeExtraction {
  const lines = text
    .split(/\r?\n|•|·|–/)
    .map((l) => l.trim())
    .filter(Boolean);

  const ingredients: ParsedIngredient[] = [];
  const steps: string[] = [];

  for (const line of lines) {
    // 1) Pasos: "1. ...", "1) ...", "Paso 2: ..."
    if (/^\d+[.)]\s/.test(line) || /^paso/i.test(line)) {
      steps.push(
        line.replace(/^\d+[.)]\s*/, "").replace(/^paso\s*\d*:?\s*/i, ""),
      );
      continue;
    }
    // 2) Ingredientes: líneas cortas que empiezan con cantidad
    const qtyMatch = line.match(
      /^(\d+(?:[/.,]\d+)*)\s*([a-záéíóú]+)?\s+(?:de\s+)?(.+)$/i,
    );
    if (qtyMatch && line.length < 80) {
      const [, qty, maybeUnit, rest] = qtyMatch;
      const unit =
        maybeUnit && UNITS.includes(maybeUnit.toLowerCase())
          ? maybeUnit
          : undefined;
      ingredients.push({
        name: (unit ? rest : `${maybeUnit ?? ""} ${rest}`).trim(),
        quantity: qty,
        unit,
        raw: line,
      });
    }
  }

  const tags: string[] = [];
  const hashtags = text.match(/#([\p{L}0-9_]+)/gu);
  if (hashtags) {
    for (const h of hashtags.slice(0, 10)) tags.push(h.replace("#", "").toLowerCase());
  }

  const minMatch = text.match(/(\d+)\s*(min|minutos)/i);

  return {
    title: hints?.title,
    summary: lines[0]?.slice(0, 160),
    ingredients,
    steps,
    tags: [...new Set(tags)],
    totalMinutes: minMatch ? parseInt(minMatch[1], 10) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Chat (base para el futuro asistente conversacional)
// ---------------------------------------------------------------------------

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export async function chat(messages: ChatMessage[]): Promise<string> {
  if (!isAIEnabled()) {
    return "La IA no está configurada. Agregá OPENAI_API_KEY para habilitar el chat.";
  }
  const completion = await client().chat.completions.create({
    model: MODEL,
    messages,
    temperature: 0.5,
  });
  return completion.choices[0]?.message?.content ?? "";
}
