import { randomUUID } from "node:crypto";
import { AuthUseCase } from "src/core/AuthUseCase.base";
import { ForbiddenError } from "src/errors";
import { FamilyErrorMessages } from "src/errors/messages/family.messages";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { FamilyService } from "src/modules/family/Family.service";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";

type GenerateFamilyInvitationLinkOptions = {
  userId: number;
};

type GenerateFamilyInvitationLinkResult = {
  invitationLink: string;
};

export class GenerateFamilyInvitationLinkUseCase extends AuthUseCase<
  GenerateFamilyInvitationLinkOptions,
  GenerateFamilyInvitationLinkResult
> {
  private readonly familyRepository: FamilyRepository = new FamilyRepository();
  private readonly familyService: FamilyService = new FamilyService();

  async executeAuth(
    options: GenerateFamilyInvitationLinkOptions,
  ): Promise<GenerateFamilyInvitationLinkResult> {
    const { userId } = options;

    const family = await this.familyRepository.findFamilyByUser(userId);
    if (!family) {
      throw new NotFoundError(FamilyErrorMessages.FAMILY_NOT_FOUND);
    }

    if (family.owner.id !== userId) {
      throw new ForbiddenError(FamilyErrorMessages.NOT_FAMILY_OWNER)
    }

    const invitationToken = randomUUID();
    await this.familyRepository.setInvitationToken(family.id, invitationToken);

    const invitationLink =
      this.familyService.createFamilyInvitationLink(invitationToken);
    return { invitationLink };
  }
}
