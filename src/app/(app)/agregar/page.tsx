import { ImportWizard } from "@/components/import-wizard";

export const metadata = { title: "Agregar receta · Mi Recetario" };

export default function AddPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Agregar receta</h1>
        <p className="text-sm text-muted">
          Desde un link de Instagram o cargándola a mano.
        </p>
      </div>
      <ImportWizard />
    </div>
  );
}
