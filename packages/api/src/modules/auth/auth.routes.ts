import { Router } from "express";
import { AuthController } from "src/modules/auth/Auth.controller";
import { AuthService } from "src/modules/auth/Auth.service";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository";
import { LoginUserUseCase } from "src/modules/auth/useCases/LoginUser.useCase";
import { LogoutUseCase } from "src/modules/auth/useCases/LogoutUser.useCase";
import { RegisterUserUseCase } from "src/modules/auth/useCases/RegisterUser.useCase";
import { UserRepository } from "src/modules/user/User.repository";

export const authRouter = Router();


const loginUseCase = new LoginUserUseCase();
const registerUseCase = new RegisterUserUseCase(userRepository, authService);
const logoutUseCase = new LogoutUseCase(refreshRepository);

const authController = new AuthController(loginUseCase, registerUseCase, logoutUseCase);

authRouter.post("/register", authController.register);
authRouter.post("/login", authController.login);
