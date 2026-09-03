import { UseCase } from "src/core/UseCase.base";
import { ValidationError } from "src/errors/http/ValidationError";
import { RegistrationInvitationRepository } from "src/modules/registrationInvitation/repositories/RegistrationInvitation.repository";
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
      throw new ValidationError("Invitation link is invalid.");
    }

    return {
      email: recordByInvitation.email,
      role: recordByInvitation.role,
    };
  }
}
