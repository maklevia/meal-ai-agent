import { ToolSet, ModelMessage } from "ai";
import { MealHistoryRepository } from "src/modules/mealHistory/repositories/MealHistoryRepository";
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

export type AgentGenerationStatus = "running" | "completed" | "failed";

export type AgentGenerationSnapshot = {
  requestId: string;
  messageId: number;
  status: AgentGenerationStatus;
  contentSoFar: string;
  startedAt: string;
};

export type ActiveAgentGeneration = AgentGenerationSnapshot & {
  threadId: number;
  abort: AbortController;
};

export type SystemPromptContext = {
  userName: string;
  preferences: UserPreferences | null;
};

export type ToolContext = {
  userId: number;
  familyId: number | null;
};

export type ToolDependencies = {
  products: ProductRepository;
  recipes: RecipeService;
  meals: MealHistoryRepository;
};
