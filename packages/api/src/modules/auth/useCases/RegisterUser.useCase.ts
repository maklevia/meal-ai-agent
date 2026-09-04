import { IUnitOfWork } from "src/core/IUnitOfWork";
import { UseCase } from "src/core/UseCase.base";
import { UnitOfWork } from "src/db/UnitOfWork";
import { ConflictError } from "src/errors/http/ConflictError";
import { ValidationError } from "src/errors/http/ValidationError";
import { AuthService } from "src/modules/auth/Auth.service";
import { RegistrationInvitationRepository } from "src/modules/auth/repositories/RegistrationInvitation.repository";
import { FamilyRepository } from "src/modules/family/repositories/Family.repository";
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
      throw new ValidationError("Invitation link is not valid");
    }

    await this.ensureEmailAvailable(invitation.email);

    const passwordHash = await this.authService.hashPassword(password);

    const createdUser = await this.uow.run(async (tx) => {
      const families = tx.get(FamilyRepository);
      const users = tx.get(UserRepository);
      const invitations = tx.get(RegistrationInvitationRepository);

      const txInvitation =
        await invitations.findByValidInvitation(invitationCode);
      if (!txInvitation) {
        throw new ValidationError("Invitation link is not valid");
      }

      if (await users.existsByEmail(txInvitation.email)) {
        throw new ConflictError("Email is already taken");
      }

      const family = await families.createFamily();

      const user = await users.createUser({
        email: txInvitation.email,
        passwordHash,
        name,
        role: txInvitation.role,
        familyId: family.id,
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
