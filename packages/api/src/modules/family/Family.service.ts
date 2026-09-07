import { Service } from "src/core/Service.base";
import { ForbiddenError } from "src/errors";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { Family } from "src/modules/family/entities/Family.entity";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";

export class FamilyService extends Service {
private readonly familyRepository: FamilyRepository = new FamilyRepository();

  createFamilyInvitationLink(invitationToken: string): string {
    return `${this.env.CLIENT_ORIGIN}/family/join?token=${invitationToken}`;
  }

  async requireFamilyOwner(userId: number): Promise<Family> {
    const family = await this.familyRepository.findFamilyByUser(userId);
    if (!family) {
      throw new NotFoundError("User does not have a family");
    }

    if(family.owner.id !== userId) {
      throw new ForbiddenError("User is not the owner of the family")
    }

    return family;
  }
}
