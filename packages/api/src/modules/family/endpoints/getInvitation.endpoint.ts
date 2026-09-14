import { defineRoute } from "src/core/RouteBuilder";
import { GetFamilyInvitationLinkUseCase } from "src/modules/family/useCases/GetFamilyInvitationLink.useCase";

export const getInvitationRoute = defineRoute({
  method: "get",
  path: "/invitation",
  auth: true,
  family: true,
  owner: true,
  useCase: () => new GetFamilyInvitationLinkUseCase(),
});
