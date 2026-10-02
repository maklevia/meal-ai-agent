import { tool } from "ai";
import { RecipeService } from "src/modules/recipe/Recipe.service";
import z from "zod";

export function createSearchRecipeTool() {
  return tool({
    description:
      "Search for recipes based on available products, cuisine type, and/or a free text query.",
    inputSchema: z.object({
      includeIngredients: z
        .array(z.string())
        .optional()
        .describe("Ingrediets from which user wants to cook a meal"),
      excludeIngredients: z
        .array(z.string())
        .optional()
        .describe("Ingredients that user may not want to have in the recipe"),
      cuisine: z
        .array(z.string())
        .optional()
        .describe(
          "Cuisine type to search recipe for, e.g. 'italian', 'japanese'",
        ),
      query: z
        .string()
        .optional()
        .describe("Free-text search query, e.g. 'pasta', 'cookies'"),
      diet: z
        .array(z.enum(["gluten-free", "vegan", "vegetarian", "pescetarian"]))
        .optional()
        .describe("Special diet known from user preferences"),
      intolerances: z
        .array(z.enum(["dairy", "gluten"]))
        .optional()
        .describe(
          "User intolerances which is known from special diet row in user preferences",
        ),
      type: z
        .string()
        .optional()
        .describe(
          "Type of a meal, e.g. main course, breakfast, dessert, appetizer, salad, soup, side dish etc",
        ),
      minProtein: z
        .number()
        .int()
        .optional()
        .describe("In case user wants high protein meal"),
      maxFat: z
        .number()
        .int()
        .optional()
        .describe("In case user wants low-fat meal"),
      number: z
        .number()
        .int()
        .optional()
        .default(3)
        .describe(
          "Maximum number of recipes fetched. Do not change until user explicitely asks a different amount of options",
        ),
    }),

    execute: async (options) => {
      const recipeService = new RecipeService();
      const result = await recipeService.search(options);
      return { recipes: result };
    },
  });
}
