import { defineRoute } from "src/core/RouteBuilder";
import { registerBodySchema } from "src/modules/auth/validators";
import { RegisterUserUseCase } from "src/modules/auth/useCases/RegisterUser.useCase";
import { COOKIE_NAMES, ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from "src/modules/auth/constants";

export const registerRoute = defineRoute({
  method: "post",
  path: "/register",
  validators: { body: registerBodySchema },
  useCase: () => new RegisterUserUseCase(),
  map: (req) => ({
    invitationCode: req.body.invitationCode,
    password: req.body.password,
    name: req.body.name,
  }),
  respond: (result, res) => {
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json(result.user);
  },
});
