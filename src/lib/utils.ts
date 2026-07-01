import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function relativeDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  if (days === 0) return "hoy";
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  if (days < 30) return `hace ${Math.floor(days / 7)} sem`;
  if (days < 365) return `hace ${Math.floor(days / 30)} meses`;
  return `hace ${Math.floor(days / 365)} años`;
}

export function formatMinutes(min: number | null | undefined): string {
  if (!min) return "—";
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h} h ${m} min` : `${h} h`;
}

export const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Difícil",
};

export const STATUS_LABELS: Record<string, string> = {
  WANT_TO_COOK: "Quiero hacer",
  COOKED: "Ya hice",
  EXCELLENT: "Excelente",
  DISLIKED: "No me gustó",
};

export const STATUS_COLORS: Record<string, string> = {
  WANT_TO_COOK: "bg-sky-500/15 text-sky-300 border-sky-500/30",
  COOKED: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  EXCELLENT: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  DISLIKED: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export const MEAL_TYPES = [
  "desayuno",
  "almuerzo",
  "merienda",
  "cena",
  "postre",
  "snack",
] as const;

export const WEEKDAYS = [
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
  "Domingo",
] as const;

/** Normaliza una fecha a las 00:00 locales (para el planner). */
export function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Devuelve el lunes de la semana de la fecha dada. */
export function startOfWeek(date: Date): Date {
  const d = startOfDay(date);
  const day = d.getDay(); // 0 dom .. 6 sab
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
