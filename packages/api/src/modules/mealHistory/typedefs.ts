export const MEAL_SCORES = [1, 2, 3, 4, 5] as const;

export type MealScore = (typeof MEAL_SCORES)[number];
