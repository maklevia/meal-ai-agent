import { defineRoute } from "src/core/RouteBuilder";
import { validatePasswordResetCodeParamsSchema } from "src/modules/auth/validators";
import { ValidatePasswordResetCodeUseCase } from "src/modules/auth/useCases/ValidatePasswordResetCode.useCase";

export const validatePasswordResetRoute = defineRoute({
  method: "get",
  path: "/password-reset-code/:resetCode",
  validators: { params: validatePasswordResetCodeParamsSchema },
  useCase: () => new ValidatePasswordResetCodeUseCase(),
  map: (req) => ({ resetCode: req.params.resetCode }),
});
