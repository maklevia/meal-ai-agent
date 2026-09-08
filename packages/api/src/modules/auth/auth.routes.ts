import { Router } from "express";
import { requireAdmin } from "src/middlewares/requireAdmin.middleware";
import {
  changePasswordBodySchema,
  loginBodySchema,
  tokenCookiesSchema,
  registerBodySchema,
  createPasswordResetLinkBodySchema,
  bootstrapAdminBodySchema,
  validatePasswordResetCodeParamsSchema,
  createRegistrationInvitationBodySchema,
  validateRegistrationInvitationParamsSchema,
  resetPasswordBodySchema,
} from "src/modules/auth/validators";
import { registerRoute } from "src/core/RouteBuilder";
import { RegisterUserUseCase } from "src/modules/auth/useCases/RegisterUser.useCase";
import {
  ACCESS_COOKIE_CLEAR_OPTIONS,
  ACCESS_COOKIE_OPTIONS,
  COOKIE_NAMES,
  REFRESH_COOKIE_CLEAR_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "src/modules/auth/constants";
import { BootstrapAdminUseCase } from "src/modules/auth/useCases/BootstrapAdmin.useCase";
import { LoginUserUseCase } from "src/modules/auth/useCases/LoginUser.useCase";
import { LogoutUseCase } from "src/modules/auth/useCases/LogoutUser.useCase";
import { RefreshUseCase } from "src/modules/auth/useCases/RefreshToken.useCase";
import { ChangePasswordUseCase } from "src/modules/auth/useCases/ChangePassword.useCase";
import { CreatePasswordResetLinkUseCase } from "src/modules/auth/useCases/CreatePasswordResetLink.useCase";
import { ValidatePasswordResetCodeUseCase } from "src/modules/auth/useCases/ValidatePasswordResetCode.useCase";
import { ResetPasswordUsingLinkUseCase } from "src/modules/auth/useCases/ResetPasswordUsingLink.useCase";
import { CreateRegistrationInvitationUseCase } from "src/modules/auth/useCases/CreateRegistrationInvitation.useCase";
import { ValidateRegistrationInvitationUseCase } from "src/modules/auth/useCases/ValidateRegistrationInvitation.useCase";

export const authRouter = Router();

registerRoute(authRouter, {
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
    res.cookie(
      COOKIE_NAMES.ACCESS_TOKEN,
      result.accessToken,
      ACCESS_COOKIE_OPTIONS,
    );
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      result.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    res.status(201).json(result.user);
  },
});

registerRoute(authRouter, {
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
    res.cookie(
      COOKIE_NAMES.ACCESS_TOKEN,
      result.accessToken,
      ACCESS_COOKIE_OPTIONS,
    );
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      result.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    res.status(201).json(result.user);
  },
});

registerRoute(authRouter, {
  method: "post",
  path: "/login",
  validators: { body: loginBodySchema },
  useCase: () => new LoginUserUseCase(),
  map: (req) => ({ email: req.body.email, password: req.body.password }),
  respond: (result, res) => {
    res.cookie(
      COOKIE_NAMES.ACCESS_TOKEN,
      result.accessToken,
      ACCESS_COOKIE_OPTIONS,
    );
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      result.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    res.status(200).json(result.user);
  },
});

registerRoute(authRouter, {
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

registerRoute(authRouter, {
  method: "post",
  path: "/refresh",
  validators: { cookies: tokenCookiesSchema },
  useCase: () => new RefreshUseCase(),
  map: (req) => ({ refreshToken: req.cookies[COOKIE_NAMES.REFRESH_TOKEN] }),
  respond: (result, res) => {
    res.cookie(
      COOKIE_NAMES.ACCESS_TOKEN,
      result.accessToken,
      ACCESS_COOKIE_OPTIONS,
    );
    res.status(204).send();
  },
});

registerRoute(authRouter, {
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

registerRoute(authRouter, {
  method: "post",
  path: "/password-reset-code",
  auth: true,
  middlewares: [requireAdmin],
  validators: { body: createPasswordResetLinkBodySchema },
  useCase: () => new CreatePasswordResetLinkUseCase(),
  map: (req) => ({ email: req.body.email }),
});

registerRoute(authRouter, {
  method: "get",
  path: "/password-reset-code/:resetCode",
  validators: { params: validatePasswordResetCodeParamsSchema },
  useCase: () => new ValidatePasswordResetCodeUseCase(),
  map: (req) => ({ resetCode: req.params.resetCode }),
});

registerRoute(authRouter, {
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
    res.cookie(
      COOKIE_NAMES.ACCESS_TOKEN,
      result.accessToken,
      ACCESS_COOKIE_OPTIONS,
    );
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      result.refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    res.status(200).send();
  },
});

registerRoute(authRouter, {
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

registerRoute(authRouter, {
  method: "get",
  path: "/invitation/:invitationCode/validate",
  validators: { params: validateRegistrationInvitationParamsSchema },
  useCase: () => new ValidateRegistrationInvitationUseCase(),
  map: (req) => ({ invitationCode: req.params.invitationCode }),
});
