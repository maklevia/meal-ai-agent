import { defineRoute } from "src/core/RouteBuilder";
import { AddProductsForFamily } from "src/modules/product/useCases/AddProductsForFamily.useCase";
import { addProductsBodySchema } from "src/modules/product/validators";
import { requireFamily } from "src/middlewares/requireFamily.middleware";

export const addProductsRoute = defineRoute({
  method: "post",
  path: "/",
  auth: true,
  middlewares: [requireFamily],
  validators: { body: addProductsBodySchema },
  useCase: () => new AddProductsForFamily(),
  map: (req) => ({
    products: req.body.products,
  }),
});
