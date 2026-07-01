"use client";
import { useEffect, useMemo, useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, X, ImageOff, GripVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api-client";
import { WEEKDAYS, startOfWeek, cn } from "@/lib/utils";
import type { MealPlanEntry } from "@/types";

type MiniRecipe = {
  id: string;
  title: string;
  imageUrl: string | null;
  totalMinutes: number | null;
};

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
function ymd(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function PlannerBoard({ recipes }: { recipes: MiniRecipe[] }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()));
  const [entries, setEntries] = useState<MealPlanEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  useEffect(() => {
    const from = ymd(weekStart);
    const to = ymd(addDays(weekStart, 6));
    setLoading(true);
    api
      .get<MealPlanEntry[]>(`/api/planner?from=${from}&to=${to}`)
      .then(setEntries)
      .catch(() => toast.error("No se pudo cargar el plan"))
      .finally(() => setLoading(false));
  }, [weekStart]);

  const entriesByDay = (day: Date) =>
    entries.filter((e) => e.date.slice(0, 10) === ymd(day));

  async function addEntry(recipeId: string, day: Date) {
    try {
      const entry = await api.post<MealPlanEntry>("/api/planner", {
        recipeId,
        date: ymd(day),
      });
      setEntries((e) => [...e, entry]);
    } catch {
      toast.error("No se pudo agregar");
    }
  }

  async function removeEntry(id: string) {
    setEntries((e) => e.filter((x) => x.id !== id));
    await api.del(`/api/planner?entryId=${id}`).catch(() => {});
  }

  async function moveEntry(entry: MealPlanEntry, day: Date) {
    // mover = borrar + crear
    setEntries((e) => e.filter((x) => x.id !== entry.id));
    await api.del(`/api/planner?entryId=${entry.id}`).catch(() => {});
    await addEntry(entry.recipe.id, day);
  }

  function onDragEnd(e: DragEndEvent) {
    const overId = e.over?.id as string | undefined;
    if (!overId) return;
    const day = days.find((d) => ymd(d) === overId);
    if (!day) return;
    const data = e.active.data.current as
      | { type: "recipe"; recipeId: string }
      | { type: "entry"; entry: MealPlanEntry };
    if (data?.type === "recipe") addEntry(data.recipeId, day);
    else if (data?.type === "entry") moveEntry(data.entry, day);
  }

  const label = `${weekStart.getDate()}/${weekStart.getMonth() + 1} – ${addDays(weekStart, 6).getDate()}/${addDays(weekStart, 6).getMonth() + 1}`;

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => setWeekStart(addDays(weekStart, -7))}
          >
            <ChevronLeft />
          </Button>
          <span className="min-w-32 text-center text-sm font-medium">{label}</span>
          <Button
            variant="secondary"
            size="icon-sm"
            onClick={() => setWeekStart(addDays(weekStart, 7))}
          >
            <ChevronRight />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setWeekStart(startOfWeek(new Date()))}
        >
          Hoy
        </Button>
      </div>

      {/* Días */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {days.map((day, i) => (
          <DayColumn
            key={ymd(day)}
            id={ymd(day)}
            label={WEEKDAYS[i]}
            dayNumber={day.getDate()}
            isToday={ymd(day) === ymd(new Date())}
            entries={entriesByDay(day)}
            onRemove={removeEntry}
            loading={loading}
          />
        ))}
      </div>

      {/* Recetas para arrastrar */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted">
          Arrastrá una receta a un día
        </h2>
        <div className="no-scrollbar flex gap-2 overflow-x-auto pb-2">
          {recipes.map((r) => (
            <DraggableRecipe key={r.id} recipe={r} />
          ))}
          {recipes.length === 0 && (
            <p className="text-sm text-subtle">No tenés recetas todavía.</p>
          )}
        </div>
      </div>
    </DndContext>
  );
}

function DayColumn({
  id,
  label,
  dayNumber,
  isToday,
  entries,
  onRemove,
  loading,
}: {
  id: string;
  label: string;
  dayNumber: number;
  isToday: boolean;
  entries: MealPlanEntry[];
  onRemove: (id: string) => void;
  loading: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex min-h-40 flex-col gap-2 rounded-2xl border p-3 transition-colors",
        isOver ? "border-primary/60 bg-primary/5" : "border-border bg-surface",
      )}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-muted">{label}</span>
        <span
          className={cn(
            "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
            isToday ? "bg-primary text-primary-foreground" : "text-subtle",
          )}
        >
          {dayNumber}
        </span>
      </div>
      {loading ? (
        <div className="skeleton h-14 rounded-xl" />
      ) : (
        entries.map((e) => (
          <PlannedEntry key={e.id} entry={e} onRemove={onRemove} />
        ))
      )}
    </div>
  );
}

function PlannedEntry({
  entry,
  onRemove,
}: {
  entry: MealPlanEntry;
  onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: `entry-${entry.id}`, data: { type: "entry", entry } });
  return (
    <div
      ref={setNodeRef}
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
          : undefined
      }
      className={cn(
        "group flex items-center gap-2 rounded-xl border border-border bg-surface-2 p-2",
        isDragging && "opacity-50",
      )}
    >
      <button {...listeners} {...attributes} className="cursor-grab text-subtle">
        <GripVertical className="size-4" />
      </button>
      {entry.recipe.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.recipe.imageUrl}
          alt=""
          className="size-8 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-8 items-center justify-center rounded-lg bg-surface text-subtle">
          <ImageOff className="size-4" />
        </div>
      )}
      <span className="line-clamp-2 flex-1 text-xs font-medium">
        {entry.recipe.title}
      </span>
      <button
        onClick={() => onRemove(entry.id)}
        className="text-subtle opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
        aria-label="Quitar"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function DraggableRecipe({ recipe }: { recipe: MiniRecipe }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `recipe-${recipe.id}`,
      data: { type: "recipe", recipeId: recipe.id },
    });
  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={
        transform
          ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 }
          : undefined
      }
      className={cn(
        "flex w-36 shrink-0 cursor-grab items-center gap-2 rounded-xl border border-border bg-surface-2 p-2 active:cursor-grabbing",
        isDragging && "opacity-60 shadow-xl",
      )}
    >
      {recipe.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={recipe.imageUrl}
          alt=""
          className="size-8 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex size-8 items-center justify-center rounded-lg bg-surface text-subtle">
          <ImageOff className="size-4" />
        </div>
      )}
      <span className="line-clamp-2 text-xs font-medium">{recipe.title}</span>
    </div>
  );
}
