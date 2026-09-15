import { defineRoute } from "src/core/RouteBuilder";
import { GetNotFinishedFamilyProducts } from "src/modules/product/useCases/GetNotFinishedFamilyProducts.useCase";

export const getProductsRoute = defineRoute({
  method: "get",
  path: "/",
  auth: true,
  family: true,
  useCase: () => new GetNotFinishedFamilyProducts(),
});
