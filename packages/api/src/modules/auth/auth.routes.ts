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
  resetPasswordUsingLinkBodySchema,
  bootstrapAdminBodySchema,
  validatePasswordResetCodeParamsSchema,
  createRegistrationInvitationBodySchema,
  validateRegistrationInvitationParamsSchema,
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
  "/changePassword",
  authMiddleware,
  validate({ body: changePasswordBodySchema }),
  authController.changePassword,
);
authRouter.post(
  "/createResetLink",
  validate({ body: createPasswordResetLinkBodySchema }),
  authMiddleware,
  requireAdmin,
  authController.createPasswordResetLink,
);
authRouter.get(
  "/reset-code/:resetCode/validate",
  validate({ params: validatePasswordResetCodeParamsSchema }),
  authController.validatePasswordResetCode,
);
authRouter.patch(
  "/resetPasswordUsingLink",
  validate({ body: resetPasswordUsingLinkBodySchema }),
  authController.resetPasswordUsingLink,
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
