"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Heart,
  Clock,
  Users,
  Flame,
  ChefHat,
  ExternalLink,
  Pencil,
  Trash2,
  Check,
  AtSign,
  Sparkles,
  StickyNote,
  ImageOff,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { StatusBadge } from "@/components/status-badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";
import { cn, formatMinutes, formatDate, DIFFICULTY_LABELS } from "@/lib/utils";
import type { Recipe, Note } from "@/types";

export function RecipeDetail({ recipe: initial }: { recipe: Recipe }) {
  const router = useRouter();
  const [recipe, setRecipe] = useState(initial);
  const [notes, setNotes] = useState<Note[]>(initial.notes ?? []);
  const [noteText, setNoteText] = useState("");
  const [busy, setBusy] = useState(false);

  async function patch(data: Partial<Recipe>) {
    setRecipe((r) => ({ ...r, ...data }));
    try {
      await api.patch(`/api/recipes/${recipe.id}`, data);
    } catch {
      toast.error("No se pudo actualizar");
    }
  }

  async function cook() {
    setBusy(true);
    try {
      const updated = await api.post<Recipe>(`/api/recipes/${recipe.id}/cook`);
      setRecipe((r) => ({
        ...r,
        timesCooked: updated.timesCooked,
        lastCookedAt: updated.lastCookedAt,
        status: updated.status,
      }));
      toast.success("¡Registrado! 🔥");
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    await api.del(`/api/recipes/${recipe.id}`);
    toast.success("Receta eliminada");
    router.push("/recetas");
    router.refresh();
  }

  async function addNote() {
    if (!noteText.trim()) return;
    const note = await api.post<Note>(`/api/recipes/${recipe.id}/notes`, {
      content: noteText.trim(),
    });
    setNotes((n) => [note, ...n]);
    setNoteText("");
    toast.success("Nota agregada");
  }

  async function delNote(noteId: string) {
    await api.del(`/api/recipes/${recipe.id}/notes?noteId=${noteId}`);
    setNotes((n) => n.filter((x) => x.id !== noteId));
  }

  async function reprocess() {
    setBusy(true);
    try {
      await api.post(`/api/recipes/${recipe.id}/reprocess`);
      toast.success("Reprocesado con IA");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft /> Volver
        </Button>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/recetas/${recipe.id}/editar`} aria-label="Editar">
              <Pencil />
            </Link>
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Eliminar">
                <Trash2 className="text-rose-400" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>¿Eliminar receta?</DialogTitle>
              </DialogHeader>
              <p className="text-sm text-muted">
                Se eliminará “{recipe.title}” y sus datos. No se puede deshacer.
              </p>
              <div className="flex justify-end gap-2">
                <DialogClose asChild>
                  <Button variant="secondary">Cancelar</Button>
                </DialogClose>
                <Button variant="destructive" onClick={remove}>
                  Eliminar
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-border"
      >
        <div className="relative aspect-video w-full bg-surface-2 sm:aspect-[21/9]">
          {recipe.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={recipe.imageUrl}
              alt={recipe.title}
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-subtle">
              <ImageOff className="size-10" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <button
            onClick={() => patch({ isFavorite: !recipe.isFavorite })}
            className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-black/40 backdrop-blur transition-transform hover:scale-110"
            aria-label="Favorito"
          >
            <Heart
              className={cn(
                "size-5",
                recipe.isFavorite
                  ? "fill-rose-500 text-rose-500"
                  : "text-white",
              )}
            />
          </button>
          <div className="absolute inset-x-0 bottom-0 space-y-2 p-5">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={recipe.status} />
              {recipe.mealType && <Badge>{recipe.mealType}</Badge>}
              {recipe.difficulty && (
                <Badge>{DIFFICULTY_LABELS[recipe.difficulty]}</Badge>
              )}
            </div>
            <h1 className="text-2xl font-bold leading-tight text-white sm:text-3xl">
              {recipe.title}
            </h1>
            {recipe.author && (
              <p className="flex items-center gap-1.5 text-sm text-white/80">
                <AtSign className="size-4" /> {recipe.author}
              </p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Meta chips */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetaChip icon={Clock} label="Tiempo" value={formatMinutes(recipe.totalMinutes)} />
        <MetaChip icon={Users} label="Porciones" value={recipe.servings ? String(recipe.servings) : "—"} />
        <MetaChip icon={Flame} label="Cocinada" value={`${recipe.timesCooked ?? 0}×`} />
        <MetaChip icon={ChefHat} label="Agregada" value={formatDate(recipe.createdAt)} />
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={cook} disabled={busy} variant="gradient" className="flex-1 sm:flex-none">
          <Check /> Cociné esto
        </Button>
        {recipe.sourceUrl && recipe.sourceUrl !== "manual" && (
          <Button variant="secondary" asChild>
            <a href={recipe.sourceUrl} target="_blank" rel="noreferrer">
              <ExternalLink /> Ver original
            </a>
          </Button>
        )}
        <Button variant="secondary" onClick={reprocess} disabled={busy}>
          <Sparkles /> IA
        </Button>
      </div>

      {/* Rating */}
      <div className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
        <span className="text-sm font-medium text-muted">Tu calificación</span>
        <StarRating
          value={recipe.rating}
          onChange={(v) => patch({ rating: v })}
        />
      </div>

      {/* Cambiar estado */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
        {(
          [
            ["WANT_TO_COOK", "Quiero hacer"],
            ["COOKED", "Ya hice"],
            ["EXCELLENT", "Excelente"],
            ["DISLIKED", "No me gustó"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            onClick={() => patch({ status: value })}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              recipe.status === value
                ? "border-primary/50 bg-primary/15 text-primary"
                : "border-border bg-surface-2 text-muted hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {recipe.aiSummary && (
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm text-foreground/90">
          <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" /> Resumen
          </p>
          {recipe.aiSummary}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* Ingredientes */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Ingredientes</h2>
          {recipe.ingredients?.length ? (
            <ul className="space-y-1.5 rounded-2xl border border-border bg-surface p-4">
              {recipe.ingredients.map((ing) => (
                <li key={ing.id} className="flex items-baseline gap-2 text-sm">
                  <span className="size-1.5 shrink-0 translate-y-1.5 rounded-full bg-primary" />
                  <span>
                    {(ing.quantity || ing.unit) && (
                      <span className="font-medium text-foreground">
                        {[ing.quantity, ing.unit].filter(Boolean).join(" ")}{" "}
                      </span>
                    )}
                    <span className="text-muted">{ing.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-subtle">
              Sin ingredientes cargados.
            </p>
          )}
        </section>

        {/* Pasos */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Preparación</h2>
          {recipe.steps?.length ? (
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li
                  key={step.id}
                  className="flex gap-3 rounded-2xl border border-border bg-surface p-4"
                >
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/90">
                    {step.content}
                  </p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-2xl border border-dashed border-border p-4 text-sm text-subtle">
              Sin pasos cargados.
            </p>
          )}
        </section>
      </div>

      {/* Notas */}
      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <StickyNote className="size-5 text-primary" /> Notas personales
        </h2>
        <div className="flex gap-2">
          <Textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            placeholder="Ej: agregar más ajo, usar parmesano, no cocinar tanto…"
            className="min-h-[52px]"
          />
          <Button onClick={addNote} variant="secondary" className="self-end">
            <Plus /> Agregar
          </Button>
        </div>
        <div className="space-y-2">
          {notes.map((n) => (
            <div
              key={n.id}
              className="group flex items-start justify-between gap-3 rounded-xl border border-border bg-surface-2 p-3"
            >
              <p className="text-sm text-foreground/90">{n.content}</p>
              <button
                onClick={() => delNote(n.id)}
                className="text-subtle opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
                aria-label="Borrar nota"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function MetaChip({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Clock;
  label: string;
  value: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-border bg-surface p-3">
      <span className="flex items-center gap-1.5 text-xs text-subtle">
        <Icon className="size-3.5" /> {label}
      </span>
      <span className="text-sm font-semibold">{value}</span>
    </div>
  );
}
