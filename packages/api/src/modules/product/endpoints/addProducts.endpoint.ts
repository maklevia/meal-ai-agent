import { defineRoute } from "src/core/RouteBuilder";
import { AddProductsForFamily } from "src/modules/product/useCases/AddProductsForFamily.useCase";
import { addProductsBodySchema } from "src/modules/product/validators";

export const addProductsRoute = defineRoute({
  method: "post",
  path: "/",
  auth: true,
  family: true,
  validators: { body: addProductsBodySchema },
  useCase: () => new AddProductsForFamily(),
  map: (req) => ({
    products: req.body.products,
  }),
});
