import { Router } from "express";
import { authMiddleware } from "src/middlewares/authMiddleware.js";
import { AuthController } from "src/modules/auth/Auth.controller.js";

export const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
authRouter.post("/logout", authMiddleware, authController.logout);
authRouter.post("/refresh", authController.refresh);
