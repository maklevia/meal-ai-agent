import { RequestHandler } from "express";
import { NotFoundError } from "src/errors/http/NotFoundError";

class RequireFamily {
  handle: RequestHandler = (req, _res, next) => {
    if (!req.user.family) {
      throw new NotFoundError("User does not have a family");
    }

    next();
  };
}

export const requireFamily = new RequireFamily().handle;
