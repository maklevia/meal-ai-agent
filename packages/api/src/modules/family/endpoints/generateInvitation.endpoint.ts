import { defineRoute } from "src/core/RouteBuilder";
import { GenerateFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GenerateFamilyInvitationLink.useCase";

export const generateInvitationRoute = defineRoute({
  method: "put",
  path: "/invitation",
  auth: true,
  family: true,
  owner: true,
  useCase: () => new GenerateFamilyInvitationLinkUseCase(),
});
