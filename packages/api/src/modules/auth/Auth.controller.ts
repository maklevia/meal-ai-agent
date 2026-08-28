import { LoginUserUseCase } from "src/modules/auth/useCases/LoginUser.useCase.js";
import { RegisterUserUseCase } from "src/modules/auth/useCases/RegisterUser.useCase.js";
import { Request, Response } from "express";
import {
  ACCESS_COOKIE_OPTIONS,
  COOKIE_NAMES,
  REFRESH_COOKIE_OPTIONS,
} from "src/modules/auth/constants.js";
import { LogoutUseCase } from "src/modules/auth/useCases/LogoutUser.useCase.js";
import { RefreshUseCase } from "src/modules/auth/useCases/RefreshToken.useCase.js";
import { AuthenticationError } from "src/errors/AppError.js";
import { LoginBody, RefreshCookies, RegisterBody } from "src/modules/auth/validators";

export class AuthController {
  private readonly loginUseCase: LoginUserUseCase = new LoginUserUseCase();
  private readonly registerUseCase: RegisterUserUseCase =
    new RegisterUserUseCase();
  private readonly logoutUseCase: LogoutUseCase = new LogoutUseCase();
  private readonly refreshUseCase: RefreshUseCase = new RefreshUseCase();

  login = async (req: Request<object, any, LoginBody>, res: Response) => {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await this.loginUseCase.execute(
      { email, password },
    );

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(200).json(user);
  };

  register = async (req: Request<object, any, RegisterBody>, res: Response) => {
    const { invitationCode, password, name } = req.body;

    const { user, accessToken, refreshToken } =
      await this.registerUseCase.execute({ invitationCode, password, name });

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json(user);
  };

  logout = async (req: Request, res: Response) => {
    const userId: number = req.userId;

    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, ACCESS_COOKIE_OPTIONS);
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, REFRESH_COOKIE_OPTIONS);

    await this.logoutUseCase.execute({ userId });

    res.status(204).send();
  };

  refresh = async (req: Request & {cookies: RefreshCookies}, res: Response) => {
    const token = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

    const { accessToken } = await this.refreshUseCase.execute({
      refreshToken: token,
    });

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_COOKIE_OPTIONS);
    res.status(204).send();
  };
}
