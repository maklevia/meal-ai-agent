import { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "src/errors/http/ForbiddenError";
import { UserRole } from "src/modules/user/typedefs";

export class RequireAdminMiddleware {
  handle = (req: Request, _res: Response, next: NextFunction): void => {
    if (req.userRole !== UserRole.Admin) {
      throw new ForbiddenError("You need Admin permission to access resource");
    }

    next();
  };
}

export const requireAdmin = new RequireAdminMiddleware().handle;
