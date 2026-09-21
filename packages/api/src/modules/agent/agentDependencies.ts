import { ToolDependencies } from "src/modules/agent/typedefs";
import { MealHistoryRepository } from "src/modules/mealHistory/repositories/MealHistoryRepository";
import { ProductRepository } from "src/modules/product/repositories/Product.repository";
import { RecipeService } from "src/modules/recipe/Recipe.service";

export function createAgentToolDependencies(): ToolDependencies {
  return {
    products: new ProductRepository(),
    recipes: new RecipeService(),
    meals: new MealHistoryRepository(),
  };
}
