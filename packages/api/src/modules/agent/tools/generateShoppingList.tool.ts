import { tool } from "ai";
import z from "zod";

export function createGenerateShoppingListTool(
) {
  return tool({
    description:
      "Generate a shopping list comparing user's products against recipe ingredients. Returns missing items.",
    inputSchema: z.object({
      ownProducts: z
        .array(
          z.object({
            name: z.string(),
            quantity: z.number(),
          }),
        )
        .describe("Products that user already has"),
      recipeIngredients: z
        .array(
          z.object({
            name: z.string(),
            quantity: z.number(),
            unit: z.string().optional(),
          }),
        )
        .describe("Ingredients required by the recipe"),
    }),

    execute: async ({ ownProducts, recipeIngredients }) => {
      const ownSet = new Set(
        ownProducts.map((p) => p.name.toLocaleLowerCase()),
      );
      const missing = recipeIngredients.filter(
        (ingredient) => !ownSet.has(ingredient.name.toLocaleLowerCase()),
      );

      return { shoppingList: missing };
    },
  });
}
