import { env } from "src/config/env";
import { UseCase } from "src/core/UseCase.base";
import { ConflictError } from "src/errors/AppError";
import { InvitationRepository } from "src/modules/invitation/repositories/Invitation.repository";
import { UserRole } from "src/modules/user/typedefs";
import { UserRepository } from "src/modules/user/repositories/User.repository";
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
  private readonly userRepository: UserRepository = new UserRepository();

  async execute(
    options: CreateInvitationOptions,
  ): Promise<CreateInvitationResult> {
    const { email, role, invitedByUserId } = options;

    const isRegistered = await this.userRepository.existsByEmail(email);
    if (isRegistered) {
      throw new ConflictError("User with this email already exists");
    }

    const invitationExpiresAt = new Date();
    invitationExpiresAt.setHours(invitationExpiresAt.getHours() + INVITATION_VALID_HOURS);

    const invitationCode: string =
      await this.invitationRepository.createInvitation({
        email,
        role,
        expiresAt: invitationExpiresAt,
        invitedByUserId,
      });

    const invitationLink: string = `${env.WEB_ORIGIN}/register?token=${invitationCode}`;

    return { invitationLink };
  }
}
