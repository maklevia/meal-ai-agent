import { Request, Response, NextFunction } from "express"
import { ForbiddenError } from "src/errors/AppError"
import { UserRole } from "src/modules/user/typedefs"

export const requireAdmin = (req: Request, _res: Response, next: NextFunction) => {
    if(req.userRole !== UserRole.Admin) {
        throw new ForbiddenError("You need Admin permission to access resource");
    }

    next();
}
