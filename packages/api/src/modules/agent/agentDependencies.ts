import { ToolDependencies } from "src/modules/agent/typedefs";
import { MealHistoryRepository } from "src/modules/mealHistory/repositories/MealHistoryRepository";
import { ProductRepository } from "src/modules/product/repositories/Product.repository";
import { RecipeService } from "src/modules/recipe/Recipe.service";

function buildAgentToolDependencies(): ToolDependencies {
  return {
    products: new ProductRepository(),
    recipes: new RecipeService(),
    meals: new MealHistoryRepository(),
  };
}

let instance: ToolDependencies | undefined;

export function getAgentToolDependencies(): ToolDependencies {
  return (instance ??= buildAgentToolDependencies())
}

export function setAgentToolDependencies(next: ToolDependencies): void {
  instance = next;
}
