"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";

export function SearchBar({
  placeholder = "Buscar recetas, ingredientes, autores…",
  defaultValue = "",
  autoFocus = false,
  onChange,
}: {
  placeholder?: string;
  defaultValue?: string;
  autoFocus?: boolean;
  onChange?: (v: string) => void;
}) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (onChange) return;
    router.push(value ? `/recetas?q=${encodeURIComponent(value)}` : "/recetas");
  }

  return (
    <form onSubmit={submit} className="relative">
      <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-subtle" />
      <input
        autoFocus={autoFocus}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
          onChange?.(e.target.value);
        }}
        placeholder={placeholder}
        className="h-12 w-full rounded-2xl border border-border bg-surface-2 pl-12 pr-4 text-sm text-foreground placeholder:text-subtle transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/30"
      />
    </form>
  );
}
