import { defineRoute } from "src/core/RouteBuilder";
import { MarkProductsAsFinishedUseCase } from "src/modules/product/useCases/MarkProductAsFinished.useCase";
import { markProductParamsSchema } from "src/modules/product/validators";
import { requireFamily } from "src/middlewares/requireFamily.middleware";

export const markProductFinishedRoute = defineRoute({
  method: "patch",
  path: "/:productId/finish",
  auth: true,
  middlewares: [requireFamily],
  validators: { params: markProductParamsSchema },
  useCase: () => new MarkProductsAsFinishedUseCase(),
  map: (req) => ({
    productId: Number(req.params.productId),
  }),
});
