import { Request, Response, NextFunction } from "express";
import { AuthenticationError } from "src/errors/http/AuthenticationError.js";
import { AuthService } from "src/modules/auth/Auth.service.js";
import { COOKIE_NAMES } from "src/modules/auth/constants.js";

export class AuthMiddleware {
  constructor(private readonly authService: AuthService = new AuthService()) {}

  handle = (req: Request, _res: Response, next: NextFunction): void => {
    const accessToken = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
    if (!accessToken) {
      throw new AuthenticationError("Not authenticated");
    }

    const { userId, userRole } = this.authService.validateAccessToken(accessToken);

    req.userId = userId;
    req.userRole = userRole;

    next();
  };
}

export const authMiddleware = new AuthMiddleware().handle;
