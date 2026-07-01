"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Trash2, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api-client";
import { MEAL_TYPES } from "@/lib/utils";
import type { RecipeStatus } from "@/types";

/** Forma permisiva que acepta tanto un Recipe (nulls) como un RecipeDraft. */
export type RecipeFormInitial = Partial<{
  title: string;
  author: string | null;
  sourceUrl: string;
  sourceType: string;
  imageUrl: string | null;
  videoUrl: string | null;
  description: string | null;
  totalMinutes: number | null;
  servings: number | null;
  difficulty: string | null;
  mealType: string | null;
  status: RecipeStatus;
  ingredients: { name: string; quantity?: string | null; unit?: string | null }[];
  steps: (string | { content: string })[];
  tags: (string | { tag: { name: string } })[];
}>;

type IngredientRow = { name: string; quantity?: string; unit?: string };

interface FormState {
  title: string;
  author: string;
  sourceUrl: string;
  imageUrl: string;
  videoUrl: string;
  description: string;
  totalMinutes: string;
  servings: string;
  difficulty: string;
  mealType: string;
  status: string;
  ingredients: IngredientRow[];
  steps: string[];
  tags: string;
}

function fromDraft(d: RecipeFormInitial): FormState {
  return {
    title: d.title ?? "",
    author: d.author ?? "",
    sourceUrl: d.sourceUrl ?? "",
    imageUrl: d.imageUrl ?? "",
    videoUrl: d.videoUrl ?? "",
    description: d.description ?? "",
    totalMinutes: d.totalMinutes ? String(d.totalMinutes) : "",
    servings: d.servings ? String(d.servings) : "",
    difficulty: d.difficulty ?? "",
    mealType: d.mealType ?? "",
    status: d.status ?? "WANT_TO_COOK",
    ingredients: d.ingredients?.length
      ? d.ingredients.map((i) => ({
          name: i.name,
          quantity: i.quantity ?? "",
          unit: i.unit ?? "",
        }))
      : [{ name: "", quantity: "", unit: "" }],
    steps: d.steps?.length
      ? d.steps.map((s) => (typeof s === "string" ? s : s.content))
      : [""],
    tags: d.tags
      ? d.tags.map((t) => (typeof t === "string" ? t : t.tag.name)).join(", ")
      : "",
  };
}

export function RecipeForm({
  initial,
  recipeId,
}: {
  initial: RecipeFormInitial;
  recipeId?: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(fromDraft(initial));
  const [saving, setSaving] = useState(false);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  function updateIngredient(i: number, patch: Partial<IngredientRow>) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.map((row, idx) =>
        idx === i ? { ...row, ...patch } : row,
      ),
    }));
  }

  async function submit() {
    if (!form.title.trim()) {
      toast.error("El título es obligatorio");
      return;
    }
    setSaving(true);
    const payload = {
      title: form.title.trim(),
      author: form.author || null,
      sourceUrl: form.sourceUrl || "manual",
      sourceType: initial.sourceType || "manual",
      imageUrl: form.imageUrl || null,
      videoUrl: form.videoUrl || null,
      description: form.description || null,
      totalMinutes: form.totalMinutes ? Number(form.totalMinutes) : null,
      servings: form.servings ? Number(form.servings) : null,
      difficulty: form.difficulty || null,
      mealType: form.mealType || null,
      status: form.status,
      ingredients: form.ingredients
        .filter((i) => i.name.trim())
        .map((i) => ({
          name: i.name.trim(),
          quantity: i.quantity || null,
          unit: i.unit || null,
        })),
      steps: form.steps.map((s) => s.trim()).filter(Boolean),
      tags: form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      if (recipeId) {
        await api.patch(`/api/recipes/${recipeId}`, payload);
        toast.success("Receta actualizada");
        router.push(`/recetas/${recipeId}`);
      } else {
        const created = await api.post<{ id: string }>("/api/recipes", payload);
        toast.success("Receta guardada");
        router.push(`/recetas/${created.id}`);
      }
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error al guardar");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      {form.imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={form.imageUrl}
          alt=""
          className="h-48 w-full rounded-2xl border border-border object-cover"
        />
      )}

      <div className="grid gap-4">
        <Field label="Título *">
          <Input
            value={form.title}
            onChange={(e) => set("title", e.target.value)}
            placeholder="Nombre de la receta"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Autor">
            <Input
              value={form.author}
              onChange={(e) => set("author", e.target.value)}
              placeholder="@cuenta"
            />
          </Field>
          <Field label="Imagen (URL)">
            <Input
              value={form.imageUrl}
              onChange={(e) => set("imageUrl", e.target.value)}
              placeholder="https://…"
            />
          </Field>
        </div>

        <Field label="Descripción">
          <Textarea
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Notas de la publicación…"
          />
        </Field>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Field label="Minutos">
            <Input
              type="number"
              value={form.totalMinutes}
              onChange={(e) => set("totalMinutes", e.target.value)}
            />
          </Field>
          <Field label="Porciones">
            <Input
              type="number"
              value={form.servings}
              onChange={(e) => set("servings", e.target.value)}
            />
          </Field>
          <Field label="Dificultad">
            <Select
              value={form.difficulty}
              onValueChange={(v) => set("difficulty", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Fácil</SelectItem>
                <SelectItem value="medium">Media</SelectItem>
                <SelectItem value="hard">Difícil</SelectItem>
              </SelectContent>
            </Select>
          </Field>
          <Field label="Tipo">
            <Select
              value={form.mealType}
              onValueChange={(v) => set("mealType", v)}
            >
              <SelectTrigger>
                <SelectValue placeholder="—" />
              </SelectTrigger>
              <SelectContent>
                {MEAL_TYPES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
        </div>

        <Field label="Estado">
          <Select value={form.status} onValueChange={(v) => set("status", v)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="WANT_TO_COOK">Quiero hacer</SelectItem>
              <SelectItem value="COOKED">Ya hice</SelectItem>
              <SelectItem value="EXCELLENT">Excelente</SelectItem>
              <SelectItem value="DISLIKED">No me gustó</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      </div>

      {/* Ingredientes */}
      <div className="space-y-2">
        <Label>Ingredientes</Label>
        <div className="space-y-2">
          {form.ingredients.map((ing, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                className="w-16"
                placeholder="Cant."
                value={ing.quantity}
                onChange={(e) => updateIngredient(i, { quantity: e.target.value })}
              />
              <Input
                className="w-20"
                placeholder="Unidad"
                value={ing.unit}
                onChange={(e) => updateIngredient(i, { unit: e.target.value })}
              />
              <Input
                placeholder="Ingrediente"
                value={ing.name}
                onChange={(e) => updateIngredient(i, { name: e.target.value })}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() =>
                  set(
                    "ingredients",
                    form.ingredients.filter((_, idx) => idx !== i),
                  )
                }
              >
                <Trash2 className="text-rose-400" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() =>
            set("ingredients", [
              ...form.ingredients,
              { name: "", quantity: "", unit: "" },
            ])
          }
        >
          <Plus /> Ingrediente
        </Button>
      </div>

      {/* Pasos */}
      <div className="space-y-2">
        <Label>Pasos</Label>
        <div className="space-y-2">
          {form.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="mt-3 flex size-6 shrink-0 items-center justify-center rounded-full bg-surface-2 text-xs text-muted">
                {i + 1}
              </span>
              <Textarea
                className="min-h-[60px]"
                placeholder={`Paso ${i + 1}`}
                value={step}
                onChange={(e) =>
                  set(
                    "steps",
                    form.steps.map((s, idx) => (idx === i ? e.target.value : s)),
                  )
                }
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="mt-1.5"
                onClick={() =>
                  set(
                    "steps",
                    form.steps.filter((_, idx) => idx !== i),
                  )
                }
              >
                <Trash2 className="text-rose-400" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => set("steps", [...form.steps, ""])}
        >
          <Plus /> Paso
        </Button>
      </div>

      <Field label="Etiquetas (separadas por coma)">
        <Input
          value={form.tags}
          onChange={(e) => set("tags", e.target.value)}
          placeholder="pastas, rápido, vegetariano"
        />
      </Field>

      <div className="sticky bottom-24 z-10 lg:bottom-4">
        <Button
          onClick={submit}
          disabled={saving}
          variant="gradient"
          size="lg"
          className="w-full shadow-xl"
        >
          {saving ? <Loader2 className="animate-spin" /> : <Save />}
          {recipeId ? "Guardar cambios" : "Guardar receta"}
        </Button>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}
