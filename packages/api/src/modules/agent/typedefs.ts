import {
  ToolSet,
  ModelMessage,
  type AssistantModelMessage,
  type ToolModelMessage,
  FinishReason,
  LanguageModelUsage,
} from "ai";
import { MealHistoryRepository } from "src/modules/mealHistory/repositories/MealHistoryRepository";
import { ProductRepository } from "src/modules/product/repositories/Product.repository";
import { RecipeService } from "src/modules/recipe/Recipe.service";
import { UserPreferences } from "src/modules/user/entities/UserPreferences.entity";

export type AgentInput = {
  systemPrompt: string;
  messages: ModelMessage[];
  tools: ToolSet;
};

export type AgentHooks = {
  onStepEnd: (step: AgentStepRecord) => Promise<void>;
}

export type AgentStepRecord = {
  stepNumber: number;
  finishReason: FinishReason | null;
  rawFinishReason: string | null;
  usage: LanguageModelUsage;
  responseMessages: AgentResponseMessage[];
}

export type AgentRunOutcome = {
  finishReason: FinishReason | null;
  rawFinishReason: string | null;
  stepCount: number;
  totalTokenCount: number 
}

export type AgentResponseMessage = AssistantModelMessage | ToolModelMessage;

export type AgentStreamEvent =
  | { type: "delta"; delta: string }
  | { type: "finish"; text: string; outcome: AgentRunOutcome };

export enum AgentRunStatus {
  Started = "started",
  Completed = "completed",
  Failed = "failed",
  Aborted = "aborted",
}

export type TerminalAgentRunStatus =
  | AgentRunStatus.Completed
  | AgentRunStatus.Failed
  | AgentRunStatus.Aborted;

export type AgentGenerationSnapshot = {
  requestId: string;
  messageId: number | null;
  status: AgentRunStatus;
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
