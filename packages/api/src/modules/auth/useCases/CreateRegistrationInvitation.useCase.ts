import { UseCase } from "src/core/UseCase.base";
import { RegistrationInvitationRepository } from "src/modules/auth/repositories/RegistrationInvitation.repository";
import { UserRole } from "src/modules/user/typedefs";
import { INVITATION_VALID_HOURS } from "src/modules/auth/constants";

type CreateRegistrationInvitationOptions = {
  email: string;
  role: UserRole;
  invitedByUserId: number;
};

type CreateRegistrationInvitationResult = {
  invitationLink: string;
};
export class CreateRegistrationInvitationUseCase extends UseCase<
  CreateRegistrationInvitationOptions,
  CreateRegistrationInvitationResult
> {
  private readonly registrationInvitationRepository: RegistrationInvitationRepository = new RegistrationInvitationRepository();

  async execute(
    options: CreateRegistrationInvitationOptions,
  ): Promise<CreateRegistrationInvitationResult> {
    const { email, role, invitedByUserId } = options;

    await this.ensureEmailAvailable(email);

    const invitationExpiresAt = new Date();
    invitationExpiresAt.setHours(invitationExpiresAt.getHours() + INVITATION_VALID_HOURS);

    const invitationCode: string =
      await this.registrationInvitationRepository.createInvitation({
        email,
        role,
        expiresAt: invitationExpiresAt,
        invitedByUserId,
      });

    const invitationLink: string = `${this.env.CLIENT_ORIGIN}/register?token=${invitationCode}`;

    return { invitationLink };
  }
}
