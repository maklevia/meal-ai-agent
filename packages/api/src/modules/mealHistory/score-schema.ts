import { z } from "zod";
import { MEAL_SCORES } from "./typedefs";

/** DB CHECK: score IN (1, 2, 3, 4, 5) */
export const mealScoreSchema = z
  .number()
  .int()
  .refine((s) => (MEAL_SCORES as readonly number[]).includes(s), {
    message: `score must be one of: ${MEAL_SCORES.join(", ")}`,
  });
