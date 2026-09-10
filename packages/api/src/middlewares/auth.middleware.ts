import { Request, Response, NextFunction, RequestHandler } from "express";
import { AuthErrorMessages } from "src/errors/messages/auth.messages";
import { AuthenticationError } from "src/errors/http/AuthenticationError";
import { AuthService } from "src/modules/auth/Auth.service";
import { COOKIE_NAMES } from "src/modules/auth/constants";
import { UserRepository } from "src/modules/user/repositories/User.repository";
import { NotFoundError } from "src/errors";

export class AuthMiddleware {
  constructor(
    private readonly authService: AuthService = new AuthService(),
    private readonly userRepository: UserRepository = new UserRepository(),
  ) {}

  handle: RequestHandler = async (
    req: Request,
    _res: Response,
    next: NextFunction,
  ): Promise<void> => {
    const accessToken = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
    if (!accessToken) {
      throw new AuthenticationError(AuthErrorMessages.NOT_AUTHENTICATED);
    }

    const { userId, userRole } =
      this.authService.validateAccessToken(accessToken);

    const user = await this.userRepository.findUserById(userId);
    if (!user) {
      throw new NotFoundError(AuthErrorMessages.USER_NOT_FOUND);
    }

    if (user.role !== userRole) {
      throw new AuthenticationError(AuthErrorMessages.TOKEN_CLAIMS_OUTDATED);
    }

    req.user = user;

    next();
  };
}

export const authMiddleware = new AuthMiddleware().handle;
