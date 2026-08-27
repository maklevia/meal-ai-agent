import { env } from "src/config/env";
import { UseCase } from "src/core/UseCase.base";
import { ConflictError } from "src/errors/AppError";
import { InvitationRepository } from "src/modules/invitation/Invitation.repository";
import { UserRole } from "src/modules/user/typedefs";
import { UserRepository } from "src/modules/user/User.repository";

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
  constructor(
    private readonly invitationRepository: InvitationRepository,
    private readonly userRepository: UserRepository,
  ) {
    super();
  }


  async execute(
    options: CreateInvitationOptions,
  ): Promise<CreateInvitationResult> {
    const { email, role, invitedByUserId } = options;

    const isRegistered = await this.userRepository.existsByEmail(email);
    if (isRegistered) {
      throw new ConflictError("User with this email already exists");
    }

    const invitationExpiresAt = new Date();
    invitationExpiresAt.setDate(invitationExpiresAt.getHours() + 24);

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
