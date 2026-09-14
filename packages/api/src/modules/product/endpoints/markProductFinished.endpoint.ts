import { defineRoute } from "src/core/RouteBuilder";
import { MarkProductsAsFinishedUseCase } from "src/modules/product/useCases/MarkProductAsFinished.useCase";
import { markProductParamsSchema } from "src/modules/product/validators";

export const markProductFinishedRoute = defineRoute({
  method: "patch",
  path: "/:productId/finish",
  auth: true,
  family: true,
  validators: { params: markProductParamsSchema },
  useCase: () => new MarkProductsAsFinishedUseCase(),
  map: (req) => ({
    productId: Number(req.params.productId),
  }),
});
