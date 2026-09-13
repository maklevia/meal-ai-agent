import { defineRoute } from "src/core/RouteBuilder";
import { GetNotFinishedFamilyProducts } from "src/modules/product/useCases/GetNotFinishedFamilyProducts.useCase";
import { requireFamily } from "src/middlewares/requireFamily.middleware";

export const getProductsRoute = defineRoute({
  method: "get",
  path: "/",
  auth: true,
  middlewares: [requireFamily],
  useCase: () => new GetNotFinishedFamilyProducts(),
});
