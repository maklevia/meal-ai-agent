import { AuthUseCase } from "src/core/AuthUseCase.base";
import { FamilyErrorMessages } from "src/errors";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { FamilyService } from "src/modules/family/Family.service";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";

type GetFamilyInvitationLinkOptions = {
};

type GetFamilyInvitationLinkResult = {
  invitationLink: string;
};

export class GetFamilyInvitationLinkUseCase extends AuthUseCase<
  GetFamilyInvitationLinkOptions,
  GetFamilyInvitationLinkResult
> {
  private readonly familyRepository: FamilyRepository = new FamilyRepository();
  private readonly familyService: FamilyService = new FamilyService();

  async executeAuth(
    options: GetFamilyInvitationLinkOptions,
  ): Promise<GetFamilyInvitationLinkResult> {
    const family = await this.familyRepository.findFamilyByUser(this.user.id);
    if (!family) {
      throw new NotFoundError(FamilyErrorMessages.FAMILY_NOT_FOUND);
    }

    if (!family.invitationToken) {
      throw new NotFoundError(FamilyErrorMessages.FAMILY_INVITATION_NOT_FOUND);
    }
    const invitationLink = this.familyService.createFamilyInvitationLink(
      family.invitationToken,
    );

    return { invitationLink };
  }
}
