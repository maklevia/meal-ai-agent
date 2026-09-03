import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware";
import { requireAdmin } from "src/middlewares/requireAdmin.middleware";
import { validate } from "src/middlewares/validate.middleware";
import { AuthController } from "src/modules/auth/Auth.controller";
import { changePasswordBodySchema, loginBodySchema, tokenCookiesSchema, registerBodySchema, createPasswordResetLinkBodySchema, resetPasswordUsingLinkBodySchema, bootstrapAdminBodySchema } from "src/modules/auth/validators";

export const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", validate({body: registerBodySchema}), authController.register);
authRouter.post("/bootstrap", validate({body: bootstrapAdminBodySchema}), authController.bootstrapAdmin)
authRouter.post("/login", validate({body: loginBodySchema}), authController.login);
authRouter.post("/logout", authMiddleware, validate({cookies: tokenCookiesSchema}), authController.logout);
authRouter.post("/refresh", validate({cookies: tokenCookiesSchema}), authController.refresh);
authRouter.patch("/change-password", authMiddleware, validate({body: changePasswordBodySchema}), authController.changePassword);
authRouter.post("/create-reset-link", validate({body: createPasswordResetLinkBodySchema}), authMiddleware, requireAdmin, authController.createPasswordResetLink);
authRouter.patch("/reset-password-using-link", validate({body: resetPasswordUsingLinkBodySchema}), authController.resetPasswordUsingLink)