import { defineRoute } from "src/core/RouteBuilder";
import { createPasswordResetLinkBodySchema } from "src/modules/auth/validators";
import { CreatePasswordResetLinkUseCase } from "src/modules/auth/useCases/CreatePasswordResetLink.useCase";
import { requireAdmin } from "src/middlewares/requireAdmin.middleware";

export const createPasswordResetRoute = defineRoute({
  method: "post",
  path: "/password-reset-code",
  auth: true,
  middlewares: [requireAdmin],
  validators: { body: createPasswordResetLinkBodySchema },
  useCase: () => new CreatePasswordResetLinkUseCase(),
  map: (req) => ({ email: req.body.email }),
});
