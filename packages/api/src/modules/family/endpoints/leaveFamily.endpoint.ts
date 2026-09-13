import { defineRoute } from "src/core/RouteBuilder";
import { leaveFamilyBodySchema } from "src/modules/family/validators";
import { LeaveFamilyUseCase } from "src/modules/family/useCases/LeaveFamily.useCase";
import { requireFamily } from "src/middlewares/requireFamily.middleware";

export const leaveFamilyRoute = defineRoute({
  method: "post",
  path: "/leave",
  auth: true,
  middlewares: [requireFamily],
  validators: { body: leaveFamilyBodySchema },
  useCase: () => new LeaveFamilyUseCase(),
  map: (req) => ({
    newOwnerEmail: req.body.newOwnerEmail,
  }),
});
