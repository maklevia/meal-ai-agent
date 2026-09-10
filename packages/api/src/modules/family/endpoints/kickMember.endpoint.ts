import { defineRoute } from "src/core/RouteBuilder";
import { kickMemberParamsSchema } from "src/modules/family/validators";
import { KickFamilyMemberUseCase } from "src/modules/family/useCases/KickFamilyMember.useCase";
import { requireFamilyOwner } from "src/middlewares/requireFamilyOwner.middleware";

export const kickMemberRoute = defineRoute({
  method: "delete",
  path: "/members/:email",
  auth: true,
  middlewares: [requireFamilyOwner],
  validators: { params: kickMemberParamsSchema },
  useCase: () => new KickFamilyMemberUseCase(),
  map: (req) => ({ memberEmail: req.params.email }),
});
