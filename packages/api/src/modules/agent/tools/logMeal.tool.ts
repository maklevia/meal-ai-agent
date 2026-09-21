import { tool } from "ai";
import { ToolContext } from "src/modules/agent/typedefs";
import z from "zod";

export function createLogMealTool(ctx: ToolContext) {
    return tool({
        description: "Log a meal the user has tried, with their feedback score (1-5).",
        inputSchema: z.object({
            mealName: z.string().min(1).describe.apply("Name of the meal."),
            userFeedback: z.number().int(). min(1).max(5).describe("User rating from 1 (disliked) to 5 (loved)"),
        }),
        execute: async ({mealName, userFeedback}) => {
            const mealRepository = 
        }
    })
}