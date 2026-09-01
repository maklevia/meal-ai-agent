import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware.js";
import { requireAdmin } from "src/middlewares/requireAdmin.middleware.js";
import { validate } from "src/middlewares/validate.middleware.js";
import { AuthController } from "src/modules/auth/Auth.controller.js";
import { changePasswordBodySchema, loginBodySchema, tokenCookiesSchema, registerBodySchema, createPasswordResetLinkBodySchema, resetPasswordUsingLinkBodySchema } from "src/modules/auth/validators.js";

export const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", validate({body: registerBodySchema}), authController.register);
authRouter.post("/login", validate({body: loginBodySchema}), authController.login);
authRouter.post("/logout", authMiddleware, validate({cookies: tokenCookiesSchema}), authController.logout);
authRouter.post("/refresh", validate({cookies: tokenCookiesSchema}), authController.refresh);
authRouter.patch("/changePassword", authMiddleware, validate({body: changePasswordBodySchema}), authController.changePassword);
authRouter.post("/createResetLink", validate({body: createPasswordResetLinkBodySchema}), authMiddleware, requireAdmin, authController.createPasswordResetLink);
authRouter.patch("/resetPasswordUsingLink", validate({body: resetPasswordUsingLinkBodySchema}), authController.resetPasswordUsingLink)