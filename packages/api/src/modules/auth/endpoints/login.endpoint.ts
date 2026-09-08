import { defineRoute } from "src/core/RouteBuilder";
import { loginBodySchema } from "src/modules/auth/validators";
import { LoginUserUseCase } from "src/modules/auth/useCases/LoginUser.useCase";
import { COOKIE_NAMES, ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from "src/modules/auth/constants";

export const loginRoute = defineRoute({
  method: "post",
  path: "/login",
  validators: { body: loginBodySchema },
  useCase: () => new LoginUserUseCase(),
  map: (req) => ({ email: req.body.email, password: req.body.password }),
  respond: (result, res) => {
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(200).json(result.user);
  },
});
