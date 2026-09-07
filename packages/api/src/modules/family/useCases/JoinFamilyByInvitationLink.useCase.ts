import { AuthUseCase } from "src/core/AuthUseCase.base";
import { ConflictError } from "src/errors";
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
      throw new ConflictError("User is already in the family");
    }

    const familyByInvitation = await this.familyRepository.findInvitationByToken(invitationToken);
    if (!familyByInvitation) {
      throw new NotFoundError("Invitation link is invalid")
    }

    await this.userRepository.updateUserFamily({userId, familyId: familyByInvitation.id});
  }
}
