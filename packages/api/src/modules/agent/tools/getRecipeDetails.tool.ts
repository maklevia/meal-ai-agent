import { tool } from "ai";
import { RecipeService } from "src/modules/recipe/Recipe.service";
import z from "zod";

export function createGetRecipeDetailsTool() {
    return tool({
        description: "Get detailed informatio(ingredients, instructions) about a specific recipe.",
        inputSchema: z.object({
            source: z.string().describe("Which recipe API this recipe came from."),
            recipeId: z.number().describe("The recipe ID from the source API"),
        }),
        execute: async ({source, recipeId}) => {
            const recipeService = new RecipeService();
            const result = await recipeService.getDetails(recipeId);
            return {recipe: result}
        }
    })
}
