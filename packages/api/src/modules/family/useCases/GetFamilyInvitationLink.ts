import { AuthUseCase } from "src/core/AuthUseCase.base";
import { ForbiddenError } from "src/errors";
import { FamilyErrorMessages } from "src/errors/messages/family.messages";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { FamilyService } from "src/modules/family/Family.service";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";

type GetFamilyInvitationLinkOptions = {
  userId: number;
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
    const { userId } = options;

    const family = await this.familyRepository.findFamilyByUser(userId);
    if (!family) {
      throw new NotFoundError(FamilyErrorMessages.FAMILY_NOT_FOUND);
    }

    if (family.owner.id !== userId) {
      throw new ForbiddenError(FamilyErrorMessages.NOT_FAMILY_OWNER);
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
