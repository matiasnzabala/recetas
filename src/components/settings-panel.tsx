"use client";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { toast } from "sonner";
import {
  Download,
  Upload,
  LogOut,
  User,
  BookOpen,
  FolderHeart,
  Flame,
  Moon,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api-client";

export function SettingsPanel({
  name,
  email,
  stats,
}: {
  name: string;
  email: string;
  stats: { recipes: number; collections: number; cooked: number };
}) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [importing, setImporting] = useState(false);

  function exportBackup() {
    window.location.href = "/api/backup";
  }

  async function importBackup(file: File) {
    setImporting(true);
    try {
      const text = await file.text();
      const json = JSON.parse(text);
      const res = await api.post<{ imported: number }>("/api/backup", json);
      toast.success(`${res.imported} recetas importadas`);
      router.refresh();
    } catch {
      toast.error("Archivo inválido");
    } finally {
      setImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Perfil */}
      <Card>
        <CardContent className="flex items-center gap-4 pt-5">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white">
            <User className="size-7" />
          </div>
          <div>
            <p className="font-semibold">{name || "Usuario"}</p>
            <p className="text-sm text-muted">{email}</p>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <Stat icon={BookOpen} label="Recetas" value={stats.recipes} />
        <Stat icon={FolderHeart} label="Colecciones" value={stats.collections} />
        <Stat icon={Flame} label="Cocinadas" value={stats.cooked} />
      </div>

      {/* Apariencia */}
      <Card>
        <CardContent className="flex items-center justify-between pt-5">
          <div className="flex items-center gap-3">
            <Moon className="size-5 text-muted" />
            <div>
              <p className="text-sm font-medium">Modo oscuro</p>
              <p className="text-xs text-subtle">
                Optimizado para uso nocturno
              </p>
            </div>
          </div>
          <Switch checked disabled />
        </CardContent>
      </Card>

      {/* Backup */}
      <Card>
        <CardContent className="space-y-3 pt-5">
          <p className="text-sm font-medium">Copia de seguridad</p>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={exportBackup}>
              <Download /> Exportar base
            </Button>
            <Button
              variant="secondary"
              onClick={() => fileRef.current?.click()}
              disabled={importing}
            >
              {importing ? <Loader2 className="animate-spin" /> : <Upload />}
              Importar base
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) importBackup(f);
                e.target.value = "";
              }}
            />
          </div>
          <p className="text-xs text-subtle">
            Exporta todas tus recetas, colecciones y listas en un archivo JSON.
          </p>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="w-full"
        onClick={() => signOut({ callbackUrl: "/login" })}
      >
        <LogOut /> Cerrar sesión
      </Button>
    </div>
  );
}

function Stat({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof BookOpen;
  label: string;
  value: number;
}) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-border bg-surface p-4">
      <Icon className="size-5 text-primary" />
      <span className="text-xl font-bold">{value}</span>
      <span className="text-xs text-muted">{label}</span>
    </div>
  );
}
