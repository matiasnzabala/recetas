"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CollectionCard } from "@/components/collection-card";
import { EmptyState } from "@/components/empty-state";
import { FolderHeart } from "lucide-react";
import { api } from "@/lib/api-client";
import type { Collection } from "@/types";

const SUGGESTED = [
  "🍝 Pastas",
  "🥩 Carnes",
  "🍗 Pollo",
  "🍰 Postres",
  "🌀 Air Fryer",
  "🎄 Navidad",
  "🎂 Cumpleaños",
  "🔥 Asado",
  "🥗 Vegetariano",
  "🍽️ Invitados",
];

export function CollectionsManager({ initial }: { initial: Collection[] }) {
  const router = useRouter();
  const [collections, setCollections] = useState(initial);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [emoji, setEmoji] = useState("📁");
  const [saving, setSaving] = useState(false);

  async function create(rawName: string, rawEmoji: string) {
    if (!rawName.trim()) return;
    setSaving(true);
    try {
      const created = await api.post<Collection>("/api/collections", {
        name: rawName.trim(),
        emoji: rawEmoji || "📁",
      });
      setCollections((c) => [...c, { ...created, _count: { recipes: 0 } }]);
      setOpen(false);
      setName("");
      setEmoji("📁");
      toast.success("Colección creada");
      router.refresh();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Colecciones</h1>
          <p className="text-sm text-muted">{collections.length} colecciones</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="gradient">
              <Plus /> Nueva
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nueva colección</DialogTitle>
            </DialogHeader>
            <div className="flex gap-2">
              <div className="flex flex-col gap-1.5">
                <Label>Emoji</Label>
                <Input
                  value={emoji}
                  onChange={(e) => setEmoji(e.target.value)}
                  className="w-16 text-center text-lg"
                  maxLength={2}
                />
              </div>
              <div className="flex flex-1 flex-col gap-1.5">
                <Label>Nombre</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Pastas"
                  onKeyDown={(e) => e.key === "Enter" && create(name, emoji)}
                />
              </div>
            </div>
            <div>
              <Label>Sugerencias</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {SUGGESTED.map((s) => {
                  const [e, ...rest] = s.split(" ");
                  const n = rest.join(" ");
                  return (
                    <button
                      key={s}
                      onClick={() => create(n, e)}
                      className="rounded-full border border-border bg-surface-2 px-3 py-1 text-xs text-muted transition-colors hover:text-foreground"
                    >
                      {s}
                    </button>
                  );
                })}
              </div>
            </div>
            <Button
              onClick={() => create(name, emoji)}
              disabled={saving}
              variant="gradient"
            >
              {saving ? <Loader2 className="animate-spin" /> : <Plus />}
              Crear colección
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {collections.length === 0 ? (
        <EmptyState
          icon={FolderHeart}
          title="Sin colecciones"
          description="Organizá tus recetas en Pastas, Postres, Air Fryer y lo que quieras."
        />
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {collections.map((c) => (
            <CollectionCard key={c.id} collection={c} />
          ))}
        </div>
      )}
    </div>
  );
}
