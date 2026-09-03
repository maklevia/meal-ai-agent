import { UseCase } from "src/core/UseCase.base";
import { InvitationRepository } from "src/modules/invitation/repositories/Invitation.repository";
import { UserRole } from "src/modules/user/typedefs";
import { INVITATION_VALID_HOURS } from "src/modules/invitation/constants";

type CreateInvitationOptions = {
  email: string;
  role: UserRole;
  invitedByUserId: number;
};

type CreateInvitationResult = {
  invitationLink: string;
};
export class CreateInvitationUseCase extends UseCase<
  CreateInvitationOptions,
  CreateInvitationResult
> {
  private readonly invitationRepository: InvitationRepository = new InvitationRepository();

  async execute(
    options: CreateInvitationOptions,
  ): Promise<CreateInvitationResult> {
    const { email, role, invitedByUserId } = options;

    await this.ensureEmailAvailable(email);

    const invitationExpiresAt = new Date();
    invitationExpiresAt.setHours(invitationExpiresAt.getHours() + INVITATION_VALID_HOURS);

    const invitationCode: string =
      await this.invitationRepository.createInvitation({
        email,
        role,
        expiresAt: invitationExpiresAt,
        invitedByUserId,
      });

    const invitationLink: string = `${this.env.CLIENT_ORIGIN}/register?token=${invitationCode}`;

    return { invitationLink };
  }
}
