import { AuthUseCase } from "src/core/AuthUseCase.base";
import { ConflictError } from "src/errors";
import { FamilyErrorMessages } from "src/errors/messages/family.messages";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";

type JoinFamilyByInvitationLinkOptions = {
  invitationToken: string;
  userId: number;
};

type JoinFamilyByInvitationLinkResult = void;

export class JoinFamilyByInvitationLinkUseCase extends AuthUseCase<
  JoinFamilyByInvitationLinkOptions,
  JoinFamilyByInvitationLinkResult
> {
    private readonly familyRepository: FamilyRepository = new FamilyRepository();

  async executeAuth(
    options: JoinFamilyByInvitationLinkOptions,
  ): Promise<JoinFamilyByInvitationLinkResult> {
    const {invitationToken, userId} = options;

    const familyByUser = await this.familyRepository.findFamilyByUser(userId);
    if (familyByUser) {
      throw new ConflictError(FamilyErrorMessages.USER_ALREADY_IN_FAMILY);
    }

    const familyByInvitation = await this.familyRepository.findInvitationByToken(invitationToken);
    if (!familyByInvitation) {
      throw new NotFoundError(FamilyErrorMessages.INVITATION_LINK_INVALID)
    }

    await this.userRepository.updateUserFamily({userId, familyId: familyByInvitation.id});
  }
}
