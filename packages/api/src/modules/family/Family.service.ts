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

}
