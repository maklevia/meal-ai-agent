import { Request, Response, NextFunction, RequestHandler } from "express"
import { ForbiddenError } from "src/errors";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";

export class RequireFamilyOwner {
    constructor(private readonly familyRepository = new FamilyRepository()) {}

    handle: RequestHandler = async (req: Request, _res: Response, next: NextFunction) => {
        const user = req.user;

        const family =  await this.familyRepository.findFamilyByUser(user.id);

        if (!family) {
            throw new NotFoundError("User does not have a family")
        }

        if (family.owner.id !== user.id) {
            throw new ForbiddenError("User has to be the owner of the family")
        }

        next();
    }
}

export const requireFamilyOwner = new RequireFamilyOwner().handle
