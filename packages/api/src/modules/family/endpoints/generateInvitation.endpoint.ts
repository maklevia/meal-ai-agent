import { defineRoute } from "src/core/RouteBuilder";
import { GenerateFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GenerateFamilyInvitationLink.useCase";
import { requireFamily } from "src/middlewares/requireFamily.middleware";
import { requireFamilyOwner } from "src/middlewares/requireFamilyOwner.middleware";

export const generateInvitationRoute = defineRoute({
  method: "put",
  path: "/invitation",
  auth: true,
  middlewares: [requireFamily, requireFamilyOwner],
  useCase: () => new GenerateFamilyInvitationLinkUseCase(),
});
