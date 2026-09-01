import { LoginUserUseCase } from "src/modules/auth/useCases/LoginUser.useCase";
import { RegisterUserUseCase } from "src/modules/auth/useCases/RegisterUser.useCase";
import { Request, Response } from "express";
import {
  ACCESS_COOKIE_OPTIONS,
  COOKIE_NAMES,
  REFRESH_COOKIE_OPTIONS,
} from "src/modules/auth/constants";
import { LogoutUseCase } from "src/modules/auth/useCases/LogoutUser.useCase";
import { RefreshUseCase } from "src/modules/auth/useCases/RefreshToken.useCase";
import {
  ChangePasswordBody,
  LoginBody,
  TokenCookies,
  RegisterBody,
  CreatePasswordResetLinkBody,
  ResetPasswordUsingLinkBody,
  BootstrapAdminBody,
} from "src/modules/auth/validators";
import { ChangePasswordUseCase } from "src/modules/auth/useCases/ChangePassword.useCase";
import { CreatePasswordResetLinkUseCase } from "src/modules/auth/useCases/CreatePasswordResetLink.useCase";
import { ResetPasswordUsingLinkUseCase } from "src/modules/auth/useCases/ResetPasswordUsingLink.useCase";
import { BootstrapAdminUseCase } from "src/modules/invitation/useCases/BootstrapAdmin.useCase";

export class AuthController {
  private readonly loginUseCase: LoginUserUseCase = new LoginUserUseCase();
  private readonly registerUseCase: RegisterUserUseCase =
    new RegisterUserUseCase();
  private readonly logoutUseCase: LogoutUseCase = new LogoutUseCase();
  private readonly refreshUseCase: RefreshUseCase = new RefreshUseCase();
  private readonly changePasswordUseCase: ChangePasswordUseCase =
    new ChangePasswordUseCase();
  private readonly createPasswordResetLinkUseCase: CreatePasswordResetLinkUseCase =
    new CreatePasswordResetLinkUseCase();
  private readonly resetPasswordUsingLinkUseCase: ResetPasswordUsingLinkUseCase =
    new ResetPasswordUsingLinkUseCase();
  private readonly bootstrapAdminUseCase: BootstrapAdminUseCase =
    new BootstrapAdminUseCase();

  login = async (req: Request<object, any, LoginBody>, res: Response) => {
    const { email, password } = req.body;

    const { user, accessToken, refreshToken } = await this.loginUseCase.execute(
      { email, password },
    );

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    res.status(200).json(user);
  };

  register = async (req: Request<object, any, RegisterBody>, res: Response) => {
    const { invitationCode, password, name } = req.body;

    const { user, accessToken, refreshToken } =
      await this.registerUseCase.execute({ invitationCode, password, name });

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    res.status(201).json(user);
  };

  logout = async (req: Request & { cookies: TokenCookies }, res: Response) => {
    res.clearCookie(COOKIE_NAMES.ACCESS_TOKEN, ACCESS_COOKIE_OPTIONS);
    const token = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];
    res.clearCookie(COOKIE_NAMES.REFRESH_TOKEN, REFRESH_COOKIE_OPTIONS);

    await this.logoutUseCase.execute({ token });

    res.status(204).send();
  };

  refresh = async (req: Request & { cookies: TokenCookies }, res: Response) => {
    const token = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

    const { accessToken } = await this.refreshUseCase.execute({
      refreshToken: token,
    });

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_COOKIE_OPTIONS);
    res.status(204).send();
  };

  changePassword = async (
    req: Request<object, any, ChangePasswordBody>,
    res: Response,
  ) => {
    const { newPassword, oldPassword } = req.body;
    const userId = req.userId;
    const currentRefreshToken = req.cookies[COOKIE_NAMES.REFRESH_TOKEN];

    await this.changePasswordUseCase.execute({
      newPassword,
      oldPassword,
      userId,
      currentRefreshToken,
    });

    res.status(204).send();
  };

  createPasswordResetLink = async (
    req: Request<object, any, CreatePasswordResetLinkBody>,
    res: Response,
  ) => {
    const { email } = req.body;

    const { passwordResetLink } =
      await this.createPasswordResetLinkUseCase.execute({ email });

    res.status(200).json({ passwordResetLink });
  };

  resetPasswordUsingLink = async (
    req: Request<object, any, ResetPasswordUsingLinkBody>,
    res: Response,
  ) => {
    const { newPassword, resetCode } = req.body;

    const { accessToken, refreshToken } =
      await this.resetPasswordUsingLinkUseCase.execute({
        newPassword,
        resetCode,
      });

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(
      COOKIE_NAMES.REFRESH_TOKEN,
      refreshToken,
      REFRESH_COOKIE_OPTIONS,
    );

    res.status(200).send();
  };

  bootstrapAdmin = async (req: Request<object, any, BootstrapAdminBody>, res: Response) => {
    const { email, password, name } = req.body;

    const {accessToken, refreshToken, user} = await this.bootstrapAdminUseCase.execute({email, password, name});

    res.cookie(COOKIE_NAMES.ACCESS_TOKEN, accessToken, ACCESS_COOKIE_OPTIONS);
    res.cookie(COOKIE_NAMES.REFRESH_TOKEN, refreshToken, REFRESH_COOKIE_OPTIONS);

    res.status(201).json(user);
  };
}
