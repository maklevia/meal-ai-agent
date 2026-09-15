import { defineRoute } from "src/core/RouteBuilder";
import { joinFamilyBodySchema } from "src/modules/family/validators";
import { JoinFamilyByInvitationLinkUseCase } from "src/modules/family/useCases/JoinFamilyByInvitationLink.useCase";

export const joinFamilyRoute = defineRoute({
  method: "post",
  path: "/members",
  auth: true,
  validators: { body: joinFamilyBodySchema },
  useCase: () => new JoinFamilyByInvitationLinkUseCase(),
  map: (req) => ({ invitationToken: req.body.invitationToken }),
});
