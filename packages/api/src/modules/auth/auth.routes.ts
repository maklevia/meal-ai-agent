import { Router } from "express";
import { requireAdmin } from "src/middlewares/requireAdmin.middleware";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { validate } from "src/middlewares/validate.middleware";
import { AuthController } from "src/modules/auth/Auth.controller";
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

export const authRouter = Router();

const authController = new AuthController();

authRouter.post(
  "/register",
  validate({ body: registerBodySchema }),
  authController.register,
);
authRouter.post(
  "/bootstrap",
  validate({ body: bootstrapAdminBodySchema }),
  authController.bootstrapAdmin,
);
authRouter.post(
  "/login",
  validate({ body: loginBodySchema }),
  authController.login,
);
authRouter.post(
  "/logout",
  authMiddleware,
  validate({ cookies: tokenCookiesSchema }),
  authController.logout,
);
authRouter.post(
  "/refresh",
  validate({ cookies: tokenCookiesSchema }),
  authController.refresh,
);
authRouter.patch(
  "/password",
  authMiddleware,
  validate({ body: changePasswordBodySchema }),
  authController.changePassword,
);
authRouter.post(
  "/password-reset-code",
  validate({ body: createPasswordResetLinkBodySchema }),
  authMiddleware,
  requireAdmin,
  authController.createPasswordResetLink,
);
authRouter.get(
  "/password-reset-code/:resetCode",
  validate({ params: validatePasswordResetCodeParamsSchema }),
  authController.validatePasswordResetCode,
);
authRouter.post(
  "/password-reset-code/:resetCode",
  validate({
    params: validatePasswordResetCodeParamsSchema,
    body: resetPasswordBodySchema,
  }),
  authController.resetPassword,
);
authRouter.post(
  "/invitation",
  authMiddleware,
  requireAdmin,
  validate({ body: createRegistrationInvitationBodySchema }),
  authController.createRegistrationInvitation,
);
authRouter.get(
  "/invitation/:invitationCode/validate",
  validate({ params: validateRegistrationInvitationParamsSchema }),
  authController.validateRegistrationInvitation,
);
