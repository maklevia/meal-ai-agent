import { defineRoute } from "src/core/RouteBuilder";
import { createRegistrationInvitationBodySchema } from "src/modules/auth/validators";
import { CreateRegistrationInvitationUseCase } from "src/modules/auth/useCases/CreateRegistrationInvitation.useCase";
import { requireAdmin } from "src/middlewares/requireAdmin.middleware";

export const createInvitationRoute = defineRoute({
  method: "post",
  path: "/invitation",
  auth: true,
  middlewares: [requireAdmin],
  validators: { body: createRegistrationInvitationBodySchema },
  useCase: () => new CreateRegistrationInvitationUseCase(),
  map: (req) => ({
    email: req.body.email,
    role: req.body.role,
  }),
});
