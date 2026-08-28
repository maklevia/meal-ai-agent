import { Request, Response, NextFunction } from "express"
import { AuthenticationError } from "src/errors/AppError.js";
import { AuthService } from "src/modules/auth/Auth.service.js";
import { COOKIE_NAMES } from "src/modules/auth/constants.js";

const authService: AuthService = new AuthService();

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
    if (!accessToken) {
        throw new AuthenticationError("Not authenticated");
    }

    const result = authService.validateAccessToken(accessToken);
    if (!result) {
        throw new AuthenticationError()
    }

    const {userId, userRole} = result;

    req.userId = userId;
    req.userRole = userRole;

    next();
}
