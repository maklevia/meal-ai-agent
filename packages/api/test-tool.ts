import { tool } from "ai";
import { z } from "zod";
export const test = tool({
    description: "test",
    parameters: z.object({}),
    execute: async (args: any) => {
        return { success: true };
    }
});
