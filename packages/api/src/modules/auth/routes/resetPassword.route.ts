import { defineRoute } from "src/core/RouteBuilder";
import { validatePasswordResetCodeParamsSchema, resetPasswordBodySchema } from "src/modules/auth/validators";
import { ResetPasswordUsingLinkUseCase } from "src/modules/auth/useCases/ResetPasswordUsingLink.useCase";
import { COOKIE_NAMES, ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from "src/modules/auth/constants";

export const resetPasswordRoute = defineRoute({
  method: "post",
  path: "/password-reset-code/:resetCode",
  validators: {
    params: validatePasswordResetCodeParamsSchema,
    body: resetPasswordBodySchema,
  },
  useCase: () => new ResetPasswordUsingLinkUseCase(),
  map: (req) => ({
    resetCode: req.params.resetCode,
    newPassword: req.body.newPassword,
  }),
  respond: (result, res) => {
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).send();
  },
});
