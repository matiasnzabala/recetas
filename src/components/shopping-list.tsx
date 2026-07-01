"use client";
import { useState } from "react";
import { toast } from "sonner";
import {
  Plus,
  Trash2,
  Sparkles,
  ShoppingCart,
  Check,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/empty-state";
import { api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import type { ShoppingItem } from "@/types";

export function ShoppingList({
  initial,
  recipes,
}: {
  initial: ShoppingItem[];
  recipes: { id: string; title: string }[];
}) {
  const [items, setItems] = useState(initial);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [open, setOpen] = useState(false);
  const [generating, setGenerating] = useState(false);

  const pending = items.filter((i) => !i.checked);
  const done = items.filter((i) => i.checked);

  async function add() {
    if (!name.trim()) return;
    const item = await api.post<ShoppingItem>("/api/shopping", {
      name: name.trim(),
    });
    setItems((i) => [...i, item]);
    setName("");
  }

  async function toggle(item: ShoppingItem) {
    const next = !item.checked;
    setItems((i) =>
      i.map((x) => (x.id === item.id ? { ...x, checked: next } : x)),
    );
    await api.patch("/api/shopping", { id: item.id, checked: next });
  }

  async function remove(id: string) {
    setItems((i) => i.filter((x) => x.id !== id));
    await api.del(`/api/shopping?id=${id}`);
  }

  async function clearChecked() {
    setItems((i) => i.filter((x) => !x.checked));
    await api.del("/api/shopping?id=checked");
  }

  async function generate() {
    if (selected.size === 0) return;
    setGenerating(true);
    try {
      const result = await api.post<ShoppingItem[]>("/api/shopping/generate", {
        recipeIds: [...selected],
      });
      setItems(result);
      setOpen(false);
      setSelected(new Set());
      toast.success("Lista generada ✨");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setGenerating(false);
    }
  }

  function toggleSelected(id: string) {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && add()}
          placeholder="Agregar ítem…"
        />
        <Button onClick={add} variant="secondary">
          <Plus /> Agregar
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Sparkles /> Generar desde recetas
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Elegí recetas</DialogTitle>
            </DialogHeader>
            <div className="max-h-72 space-y-1 overflow-y-auto">
              {recipes.map((r) => (
                <label
                  key={r.id}
                  className="flex cursor-pointer items-center gap-3 rounded-xl p-2 hover:bg-surface-2"
                >
                  <Checkbox
                    checked={selected.has(r.id)}
                    onCheckedChange={() => toggleSelected(r.id)}
                  />
                  <span className="text-sm">{r.title}</span>
                </label>
              ))}
              {recipes.length === 0 && (
                <p className="p-2 text-sm text-subtle">No hay recetas.</p>
              )}
            </div>
            <Button
              onClick={generate}
              disabled={generating || selected.size === 0}
              variant="gradient"
            >
              {generating ? <Loader2 className="animate-spin" /> : <Sparkles />}
              Generar ({selected.size})
            </Button>
          </DialogContent>
        </Dialog>

        {done.length > 0 && (
          <Button variant="secondary" onClick={clearChecked}>
            <Check /> Limpiar comprados
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title="Lista vacía"
          description="Agregá ítems a mano o generá la lista desde tus recetas."
        />
      ) : (
        <div className="space-y-4">
          <ul className="space-y-1.5">
            {pending.map((item) => (
              <Item key={item.id} item={item} onToggle={toggle} onRemove={remove} />
            ))}
          </ul>
          {done.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-subtle">
                Comprados ({done.length})
              </p>
              <ul className="space-y-1.5 opacity-60">
                {done.map((item) => (
                  <Item
                    key={item.id}
                    item={item}
                    onToggle={toggle}
                    onRemove={remove}
                  />
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Item({
  item,
  onToggle,
  onRemove,
}: {
  item: ShoppingItem;
  onToggle: (i: ShoppingItem) => void;
  onRemove: (id: string) => void;
}) {
  return (
    <li className="group flex items-center gap-3 rounded-xl border border-border bg-surface p-3">
      <Checkbox checked={item.checked} onCheckedChange={() => onToggle(item)} />
      <span
        className={cn(
          "flex-1 text-sm",
          item.checked && "text-subtle line-through",
        )}
      >
        {(item.quantity || item.unit) && (
          <span className="font-medium">
            {[item.quantity, item.unit].filter(Boolean).join(" ")}{" "}
          </span>
        )}
        {item.name}
      </span>
      <button
        onClick={() => onRemove(item.id)}
        className="text-subtle opacity-0 transition-opacity hover:text-rose-400 group-hover:opacity-100"
        aria-label="Eliminar"
      >
        <Trash2 className="size-4" />
      </button>
    </li>
  );
}
