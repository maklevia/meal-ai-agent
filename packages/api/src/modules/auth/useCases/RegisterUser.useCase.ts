import { IUnitOfWork } from "src/core/IUnitOfWork";
import { UseCase } from "src/core/UseCase.base";
import { UnitOfWork } from "src/db/UnitOfWork";
import { AuthErrorMessages } from "src/errors/messages/auth.messages";
import { ConflictError } from "src/errors/http/ConflictError";
import { ValidationError } from "src/errors/http/ValidationError";
import { AuthService } from "src/modules/auth/Auth.service";
import { RegistrationInvitationRepository } from "src/modules/auth/repositories/RegistrationInvitation.repository";
import { UserRepository } from "src/modules/user/repositories/User.repository";
import { toUserDto, UserDto } from "src/modules/user/typedefs";

type RegisterOptions = {
  invitationCode: string;
  password: string;
  name: string;
};

type RegisterResult = {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
};

export class RegisterUserUseCase extends UseCase<
  RegisterOptions,
  RegisterResult
> {
  private readonly authService: AuthService = new AuthService();
  private readonly uow: IUnitOfWork = new UnitOfWork();
  private readonly invitations: RegistrationInvitationRepository =
    new RegistrationInvitationRepository();

  async execute(options: RegisterOptions): Promise<RegisterResult> {
    const { invitationCode, password, name } = options;

    const invitation =
      await this.invitations.findByValidInvitation(invitationCode);
    if (!invitation) {
      throw new ValidationError(AuthErrorMessages.INVITATION_LINK_INVALID);
    }

    await this.ensureEmailAvailable(invitation.email);

    const passwordHash = await this.authService.hashPassword(password);

    const createdUser = await this.uow.run(async (tx) => {
      const users = tx.get(UserRepository);
      const invitations = tx.get(RegistrationInvitationRepository);

      if (await users.existsByEmail(invitation.email)) {
        throw new ConflictError(AuthErrorMessages.EMAIL_ALREADY_TAKEN);
      }

      const user = await users.createUser({
        email: invitation.email,
        passwordHash,
        name,
        role: invitation.role,
      });

      await invitations.deleteInvitation(invitationCode);

      return user;
    });

    const { accessToken, refreshToken } =
      await this.authService.handleTokenCreations({
        userId: createdUser.id,
        userRole: createdUser.role,
      });

    return { user: toUserDto(createdUser), accessToken, refreshToken };
  }
}
