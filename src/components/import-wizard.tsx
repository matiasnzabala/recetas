"use client";
import { useState } from "react";
import { toast } from "sonner";
import { Link2, Sparkles, Loader2, PencilLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { RecipeForm } from "@/components/recipe-form";
import { api } from "@/lib/api-client";
import type { RecipeDraft } from "@/types";

export function ImportWizard() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<Partial<RecipeDraft> | null>(null);

  async function analyze() {
    if (!url.trim()) return;
    setLoading(true);
    try {
      const result = await api.post<RecipeDraft>("/api/import", { url });
      setDraft(result);
      toast.success(
        result.aiProcessed
          ? "Receta analizada ✨"
          : "Link cargado. Completá los datos.",
      );
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "No se pudo analizar");
      // igual permitimos cargar a mano con la URL
      setDraft({ sourceUrl: url, sourceType: "instagram", ingredients: [], steps: [], tags: [] });
    } finally {
      setLoading(false);
    }
  }

  function manual() {
    setDraft({
      sourceUrl: url || "manual",
      sourceType: url ? "instagram" : "manual",
      ingredients: [],
      steps: [],
      tags: [],
    });
  }

  if (draft) {
    return <RecipeForm initial={draft} />;
  }

  return (
    <div className="space-y-5">
      <Card className="space-y-4 p-5">
        <div className="flex items-center gap-2 text-sm font-medium text-muted">
          <Link2 className="size-4 text-primary" />
          Pegá el link de Instagram
        </div>
        <div className="flex gap-2">
          <Input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/…"
            onKeyDown={(e) => e.key === "Enter" && analyze()}
            inputMode="url"
          />
          <Button onClick={analyze} disabled={loading || !url.trim()} variant="gradient">
            {loading ? <Loader2 className="animate-spin" /> : <Sparkles />}
            Analizar
          </Button>
        </div>
        <p className="text-xs text-subtle">
          Intentaremos obtener título, imagen, autor, ingredientes y pasos
          automáticamente. Después podés editar todo.
        </p>
      </Card>

      <div className="flex items-center gap-3 text-xs text-subtle">
        <span className="h-px flex-1 bg-border" /> o <span className="h-px flex-1 bg-border" />
      </div>

      <Button onClick={manual} variant="secondary" className="w-full">
        <PencilLine /> Cargar receta a mano
      </Button>
    </div>
  );
}
