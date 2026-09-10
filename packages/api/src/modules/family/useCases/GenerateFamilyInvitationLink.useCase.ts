import { randomUUID } from "node:crypto";
import { AuthUseCase } from "src/core/AuthUseCase.base";
import { FamilyErrorMessages } from "src/errors";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { FamilyService } from "src/modules/family/Family.service";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";

type GenerateFamilyInvitationLinkOptions = {
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

    const family = await this.familyRepository.findFamilyByUser(this.user.id);

    if (!family) {
      throw new NotFoundError(FamilyErrorMessages.FAMILY_NOT_FOUND);
    }

    const invitationToken = randomUUID();
    await this.familyRepository.setInvitationToken({
      familyId: family.id,
      invitationToken,
    });

    const invitationLink =
      this.familyService.createFamilyInvitationLink(invitationToken);
    return { invitationLink };
  }
}
