import { UseCase } from "src/core/UseCase.base";
import { ValidationError } from "src/errors/AppError";
import { InvitationRepository } from "src/modules/invitation/repositories/Invitation.repository";
import { UserRepository } from "src/modules/user/repositories/User.repository";
import { UserRole } from "src/modules/user/typedefs";

type ValidateInvitationOptions = {
  invitationCode: string;
};

type ValidateInvitationResult = {
  email: string;
  role: UserRole;
};

export class ValidateInvitationUseCase extends UseCase<
  ValidateInvitationOptions,
  ValidateInvitationResult
> {
  private readonly invitationRepository: InvitationRepository =
    new InvitationRepository();
  private readonly userRepository: UserRepository = new UserRepository();

  async execute(
    options: ValidateInvitationOptions,
  ): Promise<ValidateInvitationResult> {
    const { invitationCode } = options;

    const recordByInvitation =
      await this.invitationRepository.findByValidInvitation(invitationCode);

    if (!recordByInvitation) {
      throw new ValidationError("Invitation link is invalid.");
    }

    return {
      email: recordByInvitation.email,
      role: recordByInvitation.role,
    };
  }
}
