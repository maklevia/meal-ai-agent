export type SearchRecipeParams = {
  includeIngredients?: string[];
  excludeIngredients?: string[];
  cuisine?: string[];
  query?: string;
  diets?: string[];
  intolerances?: string[];
  type?: string;
  minProtein?: number;
  maxFat?: number;
  number?: number;
};

export type SearchRecipeResult = {
  id: number;
  title: string;
  image: string;
};

export type RecipeDetailsResult = {
  id: number;
  title: string;
  image?: string;
  summary?: string;
  servings?: number;
  readyInMinutes?: number;
  cuisines?: string[];
  diets?: string[];
  dairyFree?: boolean;
  glutenFree?: boolean;
  vegan?: boolean;
  vegetarian?: boolean;
  nutrients?: RecipeDetailsNutrients[];
  ingredients?: RecipeDetailsIngredients[];
  instructions?: RecipeDetailsInstructions[];
};

export type RecipeDetailsNutrients = {
  name: NutrientName;
  unit: string;
  amount: number;
};

export type NutrientName = "Calories" | "Fat" | "Protein" | "Fiber" | "Carbohydrates";

type RecipeDetailsIngredients = {
  name: string;
  measures: {
    us: {
      amount: number;
      unit: string;
    };
    metric: {
      amount: number;
      unit: string;
    };
  };
};

type RecipeDetailsInstructions = {
  name: string;
  steps: string[];
};
