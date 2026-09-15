import { defineRoute } from "src/core/RouteBuilder";
import { bootstrapAdminBodySchema } from "src/modules/auth/validators";
import { BootstrapAdminUseCase } from "src/modules/auth/useCases/BootstrapAdmin.useCase";
import { COOKIE_NAMES, ACCESS_COOKIE_OPTIONS, REFRESH_COOKIE_OPTIONS } from "src/modules/auth/constants";

export const bootstrapRoute = defineRoute({
  method: "post",
  path: "/bootstrap",
  validators: { body: bootstrapAdminBodySchema },
  useCase: () => new BootstrapAdminUseCase(),
  map: (req) => ({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
  }),
  respond: (result, res) => {
    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, result.accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, result.refreshToken, REFRESH_COOKIE_OPTIONS);
    res.status(201).json(result.user);
  },
});
