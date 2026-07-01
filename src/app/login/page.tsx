import { LoginForm } from "@/components/login-form";
import { ChefHat } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5">
      <div className="pointer-events-none absolute -top-40 left-1/2 size-[500px] -translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30">
            <ChefHat className="size-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Mi Recetario</h1>
          <p className="mt-1 text-sm text-muted">
            Tu biblioteca personal de recetas
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
