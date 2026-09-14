import { defineRoute } from "src/core/RouteBuilder";
import { kickMemberParamsSchema } from "src/modules/family/validators";
import { KickFamilyMemberUseCase } from "src/modules/family/useCases/KickFamilyMember.useCase";

export const kickMemberRoute = defineRoute({
  method: "delete",
  path: "/members/:email",
  auth: true,
  family: true,
  owner: true,
  validators: { params: kickMemberParamsSchema },
  useCase: () => new KickFamilyMemberUseCase(),
  map: (req) => ({
    memberEmail: req.params.email,
  }),
});
