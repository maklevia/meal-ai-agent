import { RequestHandler } from "express";
import { ForbiddenError } from "src/errors";
import { NotFoundError } from "src/errors/http/NotFoundError";

/**
 * Must run after `requireFamily`, which guarantees the family is present.
 */
export class RequireFamilyOwner {
  handle: RequestHandler = (req, _res, next) => {
    const { family } = req.user;

    if (!family) {
      throw new NotFoundError("User does not have a family");
    }

    if (family.owner.id !== req.user.id) {
      throw new ForbiddenError("User has to be the owner of the family");
    }

    next();
  };
}

export const requireFamilyOwner = new RequireFamilyOwner().handle;
