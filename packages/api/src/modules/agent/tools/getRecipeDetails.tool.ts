import { tool } from "ai";
import z from "zod";

export function createGetRecipeDetailsTool() {
    return tool({
        description: "Get detailed informatio(ingredients, instructions) about a specific recipe.",
        inputSchema: z.object({
            source: z.string().describe("Which recipe API this recipe came from."),
            recipeId: z.string().describe("The recipe ID from the source API"),
        }),
        execute: async ({source, recipeId}) => {
            //TODO integration with external API
            return {recipe: "", note: "External Api Integration awaiting"}
        }
    })
}
