import { defineRoute } from "src/core/RouteBuilder";
import { changePasswordBodySchema } from "src/modules/auth/validators";
import { ChangePasswordUseCase } from "src/modules/auth/useCases/ChangePassword.useCase";
import { COOKIE_NAMES } from "src/modules/auth/constants";

export const changePasswordRoute = defineRoute({
  method: "patch",
  path: "/password",
  auth: true,
  validators: { body: changePasswordBodySchema },
  useCase: () => new ChangePasswordUseCase(),
  map: (req) => ({
    newPassword: req.body.newPassword,
    oldPassword: req.body.oldPassword,
    currentRefreshToken: req.cookies[COOKIE_NAMES.REFRESH_TOKEN],
  }),
});
