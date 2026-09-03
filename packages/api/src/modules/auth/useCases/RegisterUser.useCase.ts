import { UseCase } from "src/core/UseCase.base";
import { ValidationError } from "src/errors/http/ValidationError";
import { AuthService } from "src/modules/auth/Auth.service";
import { InvitationRepository } from "src/modules/invitation/repositories/Invitation.repository";
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
  private readonly invitationRepository: InvitationRepository = new InvitationRepository();

  async execute(options: RegisterOptions): Promise<RegisterResult> {
    const { invitationCode, password, name } = options;

    const invitation = await this.invitationRepository.findByValidInvitation(invitationCode);
    if (!invitation) {
      throw new ValidationError("Invitation link is not valid");
    }

    await this.ensureEmailAvailable(invitation.email);

    const passwordHash = await this.authService.hashPassword(password);
    const createdUser = await this.userRepository.createUser({
      email: invitation.email,
      passwordHash,
      name,
      role: invitation.role,
    });

    await this.invitationRepository.deleteInvitation(invitationCode);

    const { accessToken, refreshToken } =
      await this.authService.handleTokenCreations({ userId: createdUser.id, userRole: createdUser.role });

    return { user: toUserDto(createdUser), accessToken, refreshToken };
  }
}
