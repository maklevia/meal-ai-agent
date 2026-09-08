import { UseCase } from "src/core/UseCase.base";
import { AuthErrorMessages } from "src/errors/messages/auth.messages";
import { ValidationError } from "src/errors/http/ValidationError";
import { RegistrationInvitationRepository } from "src/modules/auth/repositories/RegistrationInvitation.repository";
import { UserRole } from "src/modules/user/typedefs";

type ValidateRegistrationInvitationOptions = {
  invitationCode: string;
};

type ValidateRegistrationInvitationResult = {
  email: string;
  role: UserRole;
};

export class ValidateRegistrationInvitationUseCase extends UseCase<
  ValidateRegistrationInvitationOptions,
  ValidateRegistrationInvitationResult
> {
  private readonly registrationInvitationRepository: RegistrationInvitationRepository =
    new RegistrationInvitationRepository();

  async execute(
    options: ValidateRegistrationInvitationOptions,
  ): Promise<ValidateRegistrationInvitationResult> {
    const { invitationCode } = options;

    const recordByInvitation =
      await this.registrationInvitationRepository.findByValidInvitation(invitationCode);

    if (!recordByInvitation) {
      throw new ValidationError(AuthErrorMessages.INVITATION_LINK_INVALID);
    }

    return {
      email: recordByInvitation.email,
      role: recordByInvitation.role,
    };
  }
}
