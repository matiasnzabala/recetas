import { describe, it, expect } from "vitest";
import { consolidateIngredients } from "@/services/shopping";
import type { Ingredient } from "@prisma/client";

function ing(partial: Partial<Ingredient>): Ingredient {
  return {
    id: Math.random().toString(),
    recipeId: "r",
    name: "x",
    quantity: null,
    unit: null,
    raw: null,
    position: 0,
    ...partial,
  } as Ingredient;
}

describe("consolidateIngredients", () => {
  it("suma cantidades numéricas con la misma unidad", () => {
    const result = consolidateIngredients([
      ing({ name: "harina", quantity: "200", unit: "g" }),
      ing({ name: "harina", quantity: "100", unit: "g" }),
    ]);
    expect(result).toHaveLength(1);
    expect(result[0].quantity).toBe("300");
    expect(result[0].unit).toBe("g");
  });

  it("no duplica ingredientes iguales sin cantidad", () => {
    const result = consolidateIngredients([
      ing({ name: "sal" }),
      ing({ name: "Sal" }),
    ]);
    expect(result).toHaveLength(1);
  });

  it("suma fracciones", () => {
    const result = consolidateIngredients([
      ing({ name: "azúcar", quantity: "1/2", unit: "taza" }),
      ing({ name: "azúcar", quantity: "1/2", unit: "taza" }),
    ]);
    expect(result[0].quantity).toBe("1");
  });

  it("concatena si las unidades difieren", () => {
    const result = consolidateIngredients([
      ing({ name: "leche", quantity: "1", unit: "taza" }),
      ing({ name: "leche", quantity: "200", unit: "ml" }),
    ]);
    // distinta unidad => 2 entradas
    expect(result).toHaveLength(2);
  });
});
