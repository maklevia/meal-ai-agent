import { defineRoute } from "src/core/RouteBuilder";
import { tokenCookiesSchema } from "src/modules/auth/validators";
import { RefreshUseCase } from "src/modules/auth/useCases/RefreshToken.useCase";
import { COOKIE_NAMES, ACCESS_COOKIE_OPTIONS } from "src/modules/auth/constants";

export const refreshRoute = defineRoute({
  method: "post",
  path: "/refresh",
  validators: { cookies: tokenCookiesSchema },
  useCase: () => new RefreshUseCase(),
  map: (req) => ({ refreshToken: req.cookies[COOKIE_NAMES.REFRESH_TOKEN] }),
  respond: (result, res) => {
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.status(204).send();
  },
});
