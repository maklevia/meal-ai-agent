import { z } from "zod";
import { SpecialDiet } from "./typedefs";

/** DB CHECK: age > 14 AND age < 99 */
export const ageSchema = z
  .number()
  .int()
  .gt(14)
  .lt(99);

/** DB CHECK: height > 0 AND height < 300 (cm) */
export const heightSchema = z
  .number()
  .int()
  .gt(0)
  .lt(300);

/** DB CHECK: weight > 0 (kg) */
export const weightSchema = z
  .number()
  .int()
  .gt(0);

export const userPreferencesSchema = z.object({
  height: heightSchema,
  weight: weightSchema,
  age: ageSchema,
  kcalPerDay: z.number().int().positive(),
  specialDiet: z.nativeEnum(SpecialDiet),
});

export type UserPreferencesInput = z.infer<typeof userPreferencesSchema>;
