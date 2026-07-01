import { NextRequest } from "next/server";
import { requireUserId } from "@/lib/session";
import { handleError, ok } from "@/lib/api";
import { chat, isAIEnabled, type ChatMessage } from "@/services/ai";

/**
 * Endpoint base del futuro asistente conversacional de cocina.
 * Ya está preparado; solo requiere OPENAI_API_KEY para responder de verdad.
 */
export async function POST(req: NextRequest) {
  try {
    await requireUserId();
    const { messages } = (await req.json()) as { messages: ChatMessage[] };
    const system: ChatMessage = {
      role: "system",
      content:
        "Sos el asistente de 'Mi Recetario'. Ayudás con recetas, sustituciones, tiempos y técnicas de cocina. Respondé en español, breve y práctico.",
    };
    const reply = await chat([system, ...(messages ?? [])]);
    return ok({ reply, aiEnabled: isAIEnabled() });
  } catch (err) {
    return handleError(err);
  }
}
