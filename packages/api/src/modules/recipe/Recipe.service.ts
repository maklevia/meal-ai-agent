import axios from "axios";
import { Service } from "src/core/Service.base.js";
import { SPOONACULAR_BASE_URL } from "src/modules/recipe/consts";
import { RecipeDetailsNutrients, RecipeDetailsResult, SearchRecipeParams, SearchRecipeResult } from "src/modules/recipe/typedefs";

export class RecipeService extends Service {
  async search(params: SearchRecipeParams): Promise<SearchRecipeResult> {
    const searchParams = this.setParams(params);
    const result = await axios.get<SearchRecipeResult>(`${SPOONACULAR_BASE_URL}/complexSearch?${searchParams}`);

    return result.data;
  }

  async getDetails(recipeId: number) {
    const queryParam = new URLSearchParams();
    queryParam.set("apiKey", this.env.SPOONACULAR_API_KEY);
    queryParam.set("includeNutrition", "true")
    const result = await axios.get(`${SPOONACULAR_BASE_URL}/${recipeId}/information?${queryParam}`)

    return this.cutData(result.data);
  }

  private joinListFromArray = (arr?: string[]) =>
    arr?.length ? arr.join(",") : undefined;

  private setParams(params: SearchRecipeParams): URLSearchParams {
    const qs = new URLSearchParams();
    const set = (name: string, value?: string) => {
      if (value !== undefined) {
        qs.set(name, value);
      }
    };

    set(
      "includeIngredients",
      this.joinListFromArray(params.includeIngredients),
    );
    set(
      "excludeIngredients",
      this.joinListFromArray(params.excludeIngredients),
    );
    set("cuisine", this.joinListFromArray(params.cuisine));
    set("query", params.query);
    set("diets", this.joinListFromArray(params.diets));
    set("intolerances", this.joinListFromArray(params.intolerances));
    set("type", params.type);
    set("minProtein", params.minProtein?.toString());
    set("maxFat", params.maxFat?.toString());

    qs.set("apiKey", this.env.SPOONACULAR_API_KEY);

    return qs;
  }

  private cutData(data: any): RecipeDetailsResult {
    const result: RecipeDetailsResult = {
      id: data.id,
      title: data.title,
    }
    result.image = data?.image;
    result.summary = data?.summary
    result.dairyFree = data?.dairyFree;
    result.glutenFree = data?.glutenFree;
    result.vegan = data?.vegan
    result.vegetarian = data?.vegetarian;
    result.cuisines = data?.cuisines;
    result.diets = data?.diets;
    result.servings = data?.servings;
    result.readyInMinutes = data?.readyInMinutes;
    
    const allowedNutrients = new Set(["Calories", "Fat", "Protein", "Carbohydrates", "Fiber"]);
    result.nutrients = data?.nutrition?.nutrients
    ?.filter((nutrient: any) => allowedNutrients.has(nutrient.name))
    .map((nutrient: RecipeDetailsNutrients) => {
      return {
        name: nutrient?.name,
        unit: nutrient?.unit,
        amount: nutrient?.amount
      }
    })

    result.ingredients = data?.extendedIngredients?.map((ingredient: any) => {
      return {
        name: ingredient?.name,
        mesures: ingredient?.measures
      }
    })

    result.instructions = data?.analyzedInstructions?.map((instruction: any) => {
      return {
        name: instruction.name,
        steps: instruction?.steps?.map((step: any) => step?.step)
      }
    })
    return result;
  }
  
}