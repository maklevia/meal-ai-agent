import { ToolSet, ModelMessage } from "ai";
import { MealHistoryRepository } from "src/modules/mealHistory/repositories/MealHistoryRepository";
import { Product } from "src/modules/product/entities/Product.entity";
import { ProductRepository } from "src/modules/product/repositories/Product.repository";
import { RecipeService } from "src/modules/recipe/Recipe.service";
import { UserPreferences } from "src/modules/user/entities/UserPreferences.entity";

export type AgentInput = {
  systemPrompt: string;
  messages: ModelMessage[];
  tools: ToolSet;
};

export type AgentStreamEvent =
  | { type: "delta"; delta: string }
  | { type: "finish"; text: string; completionTokens: number };

export type SystemPromptContext = {
  userName: string;
  preferences: UserPreferences | null;
};

export type ToolContext = {
  userId: number,
  familyId: number | null,
}

export type ToolDependencies = {
  products: ProductRepository;
  recipes: RecipeService;
  meals: MealHistoryRepository;
};
