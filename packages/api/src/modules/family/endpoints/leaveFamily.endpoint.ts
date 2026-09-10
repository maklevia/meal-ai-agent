import { defineRoute } from "src/core/RouteBuilder";
import { leaveFamilyBodySchema } from "src/modules/family/validators";
import { LeaveFamilyUseCase } from "src/modules/family/useCases/LeaveFamily.useCase";

export const leaveFamilyRoute = defineRoute({
  method: "post",
  path: "/leave",
  auth: true,
  validators: { body: leaveFamilyBodySchema },
  useCase: () => new LeaveFamilyUseCase(),
  map: (req) => ({ newOwnerEmail: req.body.newOwnerEmail }),
});
