import { Router } from "express";
import { authMiddleware } from "src/middlewares/auth.middleware.js";
import { validate } from "src/middlewares/validate.middleware.js";
import { AuthController } from "src/modules/auth/Auth.controller.js";
import { loginBodySchema, refreshCookiesSchema, registerBodySchema } from "src/modules/auth/validators.js";

export const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", validate({body: registerBodySchema}), authController.register);
authRouter.post("/login", validate({body: loginBodySchema}), authController.login);
authRouter.post("/logout", authMiddleware, authController.logout);
authRouter.post("/refresh", validate({cookies: refreshCookiesSchema}), authController.refresh);
