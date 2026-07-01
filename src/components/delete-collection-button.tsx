"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { api } from "@/lib/api-client";

export function DeleteCollectionButton({
  id,
  name,
}: {
  id: string;
  name: string;
}) {
  const router = useRouter();

  async function remove() {
    await api.del(`/api/collections/${id}`);
    toast.success("Colección eliminada");
    router.push("/colecciones");
    router.refresh();
  }

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Eliminar colección">
          <Trash2 className="text-rose-400" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>¿Eliminar colección?</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted">
          Se eliminará “{name}”. Las recetas no se borran, solo se quitan de esta
          colección.
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
  );
}
