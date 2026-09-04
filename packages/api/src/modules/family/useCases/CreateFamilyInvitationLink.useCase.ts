import { AuthUseCase } from "src/core/AuthUseCase.base";
import { NotFoundError } from "src/errors/http/NotFoundError";
import { INVITATION_EXPIRES_IN_HOURS } from "src/modules/family/constants";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";
import { FamilyInvitationRepository } from "src/modules/family/repositories/FamilyInvitation.repository";

type CreateFamilyInvitationLinkOptions = {
  userId: number;
  invitedUserEmail: string;
};

type CreateFamilyInvitationLinkResult = {
  invitationLink: string;
};

export class CreateFamilyInvitationLinkUseCase extends AuthUseCase<
  CreateFamilyInvitationLinkOptions,
  CreateFamilyInvitationLinkResult
> {
  private readonly familyIntivationRepository: FamilyInvitationRepository =
    new FamilyInvitationRepository();
  private readonly familyRepository: FamilyRepository = new FamilyRepository();

  async executeAuth(
    options: CreateFamilyInvitationLinkOptions,
  ): Promise<CreateFamilyInvitationLinkResult> {
    const { userId, invitedUserEmail } = options;

    const family = await this.familyRepository.findFamilyByUser(userId);
    if (!family) {
      throw new NotFoundError("User's family not found");
    }

    const invitedUser =
      await this.userRepository.findUserByEmail(invitedUserEmail);
    if (!invitedUser) {
      throw new NotFoundError("Invoted user is not registered");
    }

    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + INVITATION_EXPIRES_IN_HOURS);

    const invitationRecord =
      await this.familyIntivationRepository.createInvitation({
        email: invitedUserEmail,
        familyId: family.id,
        expiresAt,
      });

    const invitationLink = `${this.env.CLIENT_ORIGIN}/family/join?token=${invitationRecord.id}`;
    return { invitationLink };
  }
}
