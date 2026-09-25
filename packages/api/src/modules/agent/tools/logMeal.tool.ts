import { tool } from "ai";
import { ToolContext, ToolDependencies } from "src/modules/agent/typedefs";
import { MealScore } from "src/modules/mealHistory/typedefs";
import z from "zod";

export function createLogMealTool(
  ctx: ToolContext,
  dependencies: ToolDependencies,
) {
  return tool({
    description:
      "Log a meal the user has tried, with their feedback score (1-5).",
    inputSchema: z.object({
      mealName: z.string().min(1).describe("Name of the meal."),
      userFeedback: z
        .number()
        .int()
        .min(1)
        .max(5)
        .describe("User rating from 1 (disliked) to 5 (loved)"),
    }),
    execute: async ({ mealName, userFeedback }) => {
      await dependencies.meals.createMealHistoryRecord({
        score: userFeedback as MealScore,
        name: mealName,
        userId: ctx.userId,
      });

      return { logged: true, mealName, score: userFeedback };
    },
  });
}
