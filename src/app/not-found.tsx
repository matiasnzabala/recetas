import Link from "next/link";
import { ChefHat } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <div className="flex size-16 items-center justify-center rounded-2xl bg-surface-2 text-muted">
        <ChefHat className="size-8" />
      </div>
      <div>
        <h1 className="text-2xl font-bold">Página no encontrada</h1>
        <p className="text-sm text-muted">
          La receta que buscás no existe o fue eliminada.
        </p>
      </div>
      <Button asChild variant="gradient">
        <Link href="/">Volver al inicio</Link>
      </Button>
    </div>
  );
}
