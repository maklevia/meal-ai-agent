import { IUnitOfWork } from "src/core/IUnitOfWork";
import { UseCase } from "src/core/UseCase.base";
import { UnitOfWork } from "src/db/UnitOfWork";
import { AuthErrorMessages } from "src/errors/messages/auth.messages";
import { ConflictError } from "src/errors/http/ConflictError";
import { AuthService } from "src/modules/auth/Auth.service";
import { UserRepository } from "src/modules/user/repositories/User.repository";
import { toUserDto, UserDto } from "src/modules/user/typedefs";

type BootstrapAdminOptions = {
  email: string;
  password: string;
  name: string;
};

type BootstrapAdminResult = {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
};

export class BootstrapAdminUseCase extends UseCase<
  BootstrapAdminOptions,
  BootstrapAdminResult
> {
  private readonly authService: AuthService = new AuthService();
  private readonly uow: IUnitOfWork = new UnitOfWork();

  async execute(options: BootstrapAdminOptions): Promise<BootstrapAdminResult> {
    const { email, password, name } = options;

    const existsAnyUser = await this.userRepository.existsAny();
    if (existsAnyUser) {
      throw new ConflictError(AuthErrorMessages.SYSTEM_ALREADY_INITIALIZED);
    }

    const passwordHash = await this.authService.hashPassword(password);

    const user = await this.uow.run(async (tx) => {
      const users = tx.get(UserRepository);

      if (await users.existsAny()) {
        throw new ConflictError(AuthErrorMessages.SYSTEM_ALREADY_INITIALIZED);
      }

      const createdUser = await users.createAdmin({email, passwordHash, name});

      return createdUser;
    })
    

    const userDto = toUserDto(user);

    const { accessToken, refreshToken } =
      await this.authService.handleTokenCreations({
        userId: userDto.id,
        userRole: userDto.role,
      });

    return { user: userDto, accessToken, refreshToken };
  }
}
