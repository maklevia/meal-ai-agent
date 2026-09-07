import { Request, Response, NextFunction } from "express"
import { FamilyService } from "src/modules/family/Family.service";

export class RequireFamilyOwner {
    constructor(private readonly familyService = new FamilyService()) {}

    handle = async (req: Request, _res: Response, next: NextFunction) => {
        const userId = req.userId;

        await this.familyService.requireFamilyOwner(userId);

        next();
    }
}

export const requireFamilyOwner = new RequireFamilyOwner().handle
