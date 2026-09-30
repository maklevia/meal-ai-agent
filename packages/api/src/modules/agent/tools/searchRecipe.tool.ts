import { tool } from "ai";
import z from "zod";

export function createSearchRecipeTool() {
  return tool({
    description:
      "Search for recipes based on available products, cuisine type, and/or a free text query.",
    inputSchema: z.object({
      products: z
        .array(z.string())
        .optional()
        .describe("Product names to search recipes for"),
      cuisine: z
        .string()
        .optional()
        .describe(
          "Cuisine type to search recipe for, e.g. 'italian', 'japanese'",
        ),
      query: z
        .string()
        .optional()
        .describe("Free-text search query, e.g. 'vegan', 'high protein"),
    }),

    execute: async ({ products, cuisine, query }) => {
      //TODO: external api
      return { recipes: [], note: "Recipe search API integration pending" };
    },
  });
}
