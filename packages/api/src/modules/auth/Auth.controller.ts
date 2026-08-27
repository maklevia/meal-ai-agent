import { LoginUserUseCase } from "src/modules/auth/useCases/LoginUser.useCase";
import { RegisterUserUseCase } from "src/modules/auth/useCases/RegisterUser.useCase";
import { Request, Response } from "express";
import {
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "src/modules/auth/constants";
import { LogoutUseCase } from "src/modules/auth/useCases/LogoutUser.useCase";

export class AuthController {
  private readonly loginUseCase: LoginUserUseCase = new LoginUserUseCase();
  private readonly registerUseCase: RegisterUserUseCase = new RegisterUserUseCase();
  private readonly logoutUseCase: LogoutUseCase = new LogoutUseCase();

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await this.loginUseCase.execute(
      { email, password },
    );

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json(user);
  };

  register = async (req: Request, res: Response) => {
    const { email, password, name } = req.body;

    const { user, accessToken, refreshToken } =
      await this.registerUseCase.execute({ email, password, name });

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json(user);
  };

  logout = async (req: Request, res: Response) => {
    const userId: number = req.userId;

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    await this.logoutUseCase.execute({ userId });
  };
}
