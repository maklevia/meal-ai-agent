import { defineRoute } from "src/core/RouteBuilder";
import { tokenCookiesSchema } from "src/modules/auth/validators";
import { LogoutUseCase } from "src/modules/auth/useCases/LogoutUser.useCase";
import { COOKIE_NAMES, ACCESS_COOKIE_CLEAR_OPTIONS, REFRESH_COOKIE_CLEAR_OPTIONS } from "src/modules/auth/constants";

export const logoutRoute = defineRoute({
  method: "post",
  path: "/logout",
  auth: true,
  validators: { cookies: tokenCookiesSchema },
  useCase: () => new LogoutUseCase(),
  map: (req) => ({
    refreshToken: req.cookies[COOKIE_NAMES.REFRESH_TOKEN],
  }),
  respond: (_, res) => {
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, ACCESS_COOKIE_CLEAR_OPTIONS);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, REFRESH_COOKIE_CLEAR_OPTIONS);
    res.status(204).send();
  },
});
