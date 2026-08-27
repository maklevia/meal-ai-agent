import { Router } from "express";
import { AuthController } from "src/modules/auth/Auth.controller";

export const authRouter = Router();

const authController = new AuthController();

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
