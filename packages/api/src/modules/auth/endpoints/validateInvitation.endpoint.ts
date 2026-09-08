import { defineRoute } from "src/core/RouteBuilder";
import { validateRegistrationInvitationParamsSchema } from "src/modules/auth/validators";
import { ValidateRegistrationInvitationUseCase } from "src/modules/auth/useCases/ValidateRegistrationInvitation.useCase";

export const validateInvitationRoute = defineRoute({
  method: "get",
  path: "/invitation/:invitationCode/validate",
  validators: { params: validateRegistrationInvitationParamsSchema },
  useCase: () => new ValidateRegistrationInvitationUseCase(),
  map: (req) => ({ invitationCode: req.params.invitationCode }),
});
