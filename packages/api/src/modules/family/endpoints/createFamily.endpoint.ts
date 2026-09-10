import { defineRoute } from "src/core/RouteBuilder";
import { createFamilyBodySchema } from "src/modules/family/validators";
import { CreateFamilyUseCase } from "src/modules/family/useCases/CreateFamily.useCase";

export const createFamilyRoute = defineRoute({
  method: "post",
  path: "/",
  auth: true,
  validators: { body: createFamilyBodySchema },
  useCase: () => new CreateFamilyUseCase(),
  map: (req) => ({ familyName: req.body.familyName }),
  respond: (_, res) => res.status(201).json({ message: `Family created.` }),
});
