import { ToolSet } from "ai";
import { createGenerateShoppingListTool } from "src/modules/agent/tools/generateShoppingList.tool";
import { createGetRecipeDetailsTool } from "src/modules/agent/tools/getRecipeDetails.tool";
import { createGetUserProductsTool } from "src/modules/agent/tools/getUserProducts.tool";
import { createLogMealTool } from "src/modules/agent/tools/logMeal.tool";
import { createSearchRecipeTool } from "src/modules/agent/tools/searchRecipe.tool";
import { ToolDependencies, ToolContext } from "src/modules/agent/typedefs";

export function createAgentTools(
  ctx: ToolContext,
  dependencies: ToolDependencies,
): ToolSet {
  return {
    getUserProducts: createGetUserProductsTool(ctx, dependencies),
    generateShoppingList: createGenerateShoppingListTool(),
    logMeal: createLogMealTool(ctx, dependencies),
    getRecipeDetails: createGetRecipeDetailsTool(),
    searchRecipe: createSearchRecipeTool(),
  };
}
