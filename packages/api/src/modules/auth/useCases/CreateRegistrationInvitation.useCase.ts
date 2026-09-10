import { UseCase } from "src/core/UseCase.base";
import { RegistrationInvitationRepository } from "src/modules/auth/repositories/RegistrationInvitation.repository";
import { UserRole } from "src/modules/user/typedefs";
import { INVITATION_VALID_HOURS } from "src/modules/auth/constants";
import { AuthUseCase } from "src/core/AuthUseCase.base";

type CreateRegistrationInvitationOptions = {
  email: string;
  role: UserRole;
};

type CreateRegistrationInvitationResult = {
  invitationLink: string;
};
export class CreateRegistrationInvitationUseCase extends AuthUseCase<
  CreateRegistrationInvitationOptions,
  CreateRegistrationInvitationResult
> {
  private readonly registrationInvitationRepository: RegistrationInvitationRepository = new RegistrationInvitationRepository();

  async executeAuth(
    options: CreateRegistrationInvitationOptions,
  ): Promise<CreateRegistrationInvitationResult> {
    const { email, role } = options;

    await this.ensureEmailAvailable(email);

    const invitationExpiresAt = new Date();
    invitationExpiresAt.setHours(invitationExpiresAt.getHours() + INVITATION_VALID_HOURS);

    const invitationCode: string =
      await this.registrationInvitationRepository.createInvitation({
        email,
        role,
        expiresAt: invitationExpiresAt,
        invitedByUserId: this.user.id,
      });

    const invitationLink: string = `${this.env.CLIENT_ORIGIN}/register?token=${invitationCode}`;

    return { invitationLink };
  }
}
