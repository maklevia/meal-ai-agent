import { Request, Response, NextFunction } from "express";
import { AuthErrorMessages } from "src/errors/messages/auth.messages";
import { ForbiddenError } from "src/errors/http/ForbiddenError";
import { UserRole } from "src/modules/user/typedefs";

export class RequireAdminMiddleware {
  handle = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.user.role !== UserRole.Admin) {
      throw new ForbiddenError(AuthErrorMessages.ADMIN_PERMISSION_REQUIRED);
    }

    next();
  };
}

export const requireAdmin = new RequireAdminMiddleware().handle;
