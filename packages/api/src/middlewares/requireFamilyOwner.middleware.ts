import { Request, Response, NextFunction } from "express"
import { ForbiddenError } from "src/errors";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";

export class RequireFamilyOwner {
    constructor(private readonly familyRepository = new FamilyRepository()) {}

    handle = async (req: Request, _res: Response, next: NextFunction) => {
        const userId = req.userId;

        const family =  await this.familyRepository.findFamilyByUser(userId);

        if (!family) {
            throw new NotFoundError("User does not have a family")
        }

        if (family.owner.id !== userId) {
            throw new ForbiddenError("User has to be the owner of the family")
        }

        next();
    }
}

export const requireFamilyOwner = new RequireFamilyOwner().handle
