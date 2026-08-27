import { LoginUserUseCase } from "src/modules/auth/useCases/LoginUser.useCase.js";
import { RegisterUserUseCase } from "src/modules/auth/useCases/RegisterUser.useCase.js";
import { Request, Response } from "express";
import {
  ACCESS_COOKIE_OPTIONS,
  REFRESH_COOKIE_OPTIONS,
} from "src/modules/auth/constants.js";
import { LogoutUseCase } from "src/modules/auth/useCases/LogoutUser.useCase.js";
import { RefreshUseCase } from "src/modules/auth/useCases/RefreshToken.useCase.js";
import { AuthenticationError } from "src/errors/AppError.js";

export class AuthController {
  private readonly loginUseCase: LoginUserUseCase = new LoginUserUseCase();
  private readonly registerUseCase: RegisterUserUseCase =
    new RegisterUserUseCase();
  private readonly logoutUseCase: LogoutUseCase = new LogoutUseCase();
  private readonly refreshUseCase: RefreshUseCase = new RefreshUseCase();

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
    const { invitationCode, password, name } = req.body;

    const { user, accessToken, refreshToken } =
      await this.registerUseCase.execute({ invitationCode, password, name });

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie("refreshToken", refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json(user);
  };

  logout = async (req: Request, res: Response) => {
    const userId: number = req.userId;

    res.clearCookie("accessToken", ACCESS_COOKIE_OPTIONS);
    res.clearCookie("refreshToken", REFRESH_COOKIE_OPTIONS);

    await this.logoutUseCase.execute({ userId });

    res.status(204).send();
  };

  refresh = async (req: Request, res: Response) => {
    const token = req.cookies["refreshToken"];

    if (!token) {
      throw new AuthenticationError();
    }
    const { accessToken } = await this.refreshUseCase.execute({
      refreshToken: token,
    });

    res.cookie("accessToken", accessToken, ACCESS_COOKIE_OPTIONS);
    res.status(204).send();
  };
}
