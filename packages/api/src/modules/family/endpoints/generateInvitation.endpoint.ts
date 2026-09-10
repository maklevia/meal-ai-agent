import { defineRoute } from "src/core/RouteBuilder";
import { GenerateFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GenerateFamilyInvitationLink.useCase";
import { requireFamilyOwner } from "src/middlewares/requireFamilyOwner.middleware";

export const generateInvitationRoute = defineRoute({
  method: "put",
  path: "/invitation",
  auth: true,
  middlewares: [requireFamilyOwner],
  useCase: () => new GenerateFamilyInvitationLinkUseCase(),
  map: () => ({}),
});
