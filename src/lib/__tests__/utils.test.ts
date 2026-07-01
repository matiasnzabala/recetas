import { describe, it, expect } from "vitest";
import {
  formatMinutes,
  slugify,
  startOfWeek,
  startOfDay,
} from "@/lib/utils";
import {
  isInstagramUrl,
  normalizeUrl,
} from "@/services/instagram";

describe("formatMinutes", () => {
  it("muestra minutos", () => {
    expect(formatMinutes(45)).toBe("45 min");
  });
  it("muestra horas y minutos", () => {
    expect(formatMinutes(90)).toBe("1 h 30 min");
  });
  it("muestra guion si es null", () => {
    expect(formatMinutes(null)).toBe("—");
  });
});

describe("slugify", () => {
  it("normaliza acentos y espacios", () => {
    expect(slugify("Ñoquis de Papá")).toBe("noquis-de-papa");
  });
});

describe("startOfWeek", () => {
  it("devuelve un lunes", () => {
    const monday = startOfWeek(new Date("2026-06-30")); // martes
    expect(monday.getDay()).toBe(1);
  });
});

describe("startOfDay", () => {
  it("resetea la hora", () => {
    const d = startOfDay(new Date("2026-06-30T15:30:00"));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});

describe("instagram helpers", () => {
  it("detecta urls de instagram", () => {
    expect(isInstagramUrl("https://www.instagram.com/reel/abc")).toBe(true);
    expect(isInstagramUrl("https://example.com")).toBe(false);
  });
  it("normaliza agregando https", () => {
    expect(normalizeUrl("instagram.com/x")).toBe("https://instagram.com/x");
  });
});
