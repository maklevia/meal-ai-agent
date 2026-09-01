import { Request, Response, NextFunction } from "express"
import { AuthenticationError } from "src/errors/AppError";
import { AuthService } from "src/modules/auth/Auth.service";
import { COOKIE_NAMES } from "src/modules/auth/constants";

const authService: AuthService = new AuthService();

export const authMiddleware = (req: Request, _res: Response, next: NextFunction) => {
    const accessToken = req.cookies?.[COOKIE_NAMES.ACCESS_TOKEN];
    if (!accessToken) {
        throw new AuthenticationError("Not authenticated");
    }

    const { userId, userRole } = authService.validateAccessToken(accessToken);

    req.userId = userId;
    req.userRole = userRole;

    next();
}
