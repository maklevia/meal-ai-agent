import { defineRoute } from "src/core/RouteBuilder";
import { GetFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GetFamilyInvitationLink.useCase";
import { requireFamilyOwner } from "src/middlewares/requireFamilyOwner.middleware";

export const getInvitationRoute = defineRoute({
  method: "get",
  path: "/invitation",
  auth: true,
  middlewares: [requireFamilyOwner],
  useCase: () => new GetFamilyInvitationLinkUseCase(),
  map: () => ({}),
});
