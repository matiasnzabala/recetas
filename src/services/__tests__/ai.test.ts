import { describe, it, expect } from "vitest";
import { heuristicExtract } from "@/services/ai";

describe("heuristicExtract", () => {
  it("detecta ingredientes con cantidad y unidad", () => {
    const text = `Fideos caseros
200 g de harina
2 huevos
1 pizca de sal`;
    const result = heuristicExtract(text);
    const harina = result.ingredients.find((i) => i.name.includes("harina"));
    expect(harina?.quantity).toBe("200");
    expect(harina?.unit).toBe("g");
  });

  it("extrae hashtags como tags", () => {
    const result = heuristicExtract("Rica pizza #pizza #casero #italiana");
    expect(result.tags).toContain("pizza");
    expect(result.tags).toContain("casero");
  });

  it("detecta minutos", () => {
    const result = heuristicExtract("Lista en 25 minutos");
    expect(result.totalMinutes).toBe(25);
  });

  it("detecta pasos numerados", () => {
    const text = `1. Mezclar todo
2. Hornear 20 minutos`;
    const result = heuristicExtract(text);
    expect(result.steps.length).toBeGreaterThanOrEqual(2);
  });
});
