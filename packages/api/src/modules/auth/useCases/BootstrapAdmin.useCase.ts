import { UseCase } from "src/core/UseCase.base";
import { ConflictError } from "src/errors/http/ConflictError";
import { AuthService } from "src/modules/auth/Auth.service";
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

  async execute(options: BootstrapAdminOptions): Promise<BootstrapAdminResult> {
    const { email, password, name } = options;

    const passwordHash = await this.authService.hashPassword(password);

    const existsAnyUser = await this.userRepository.existsAny();
    if (existsAnyUser) {
      throw new ConflictError("System already initialized");
    }

    const user = await this.userRepository.createAdmin({
      name,
      email,
      passwordHash,
    });

    const userDto = toUserDto(user);

    const { accessToken, refreshToken } =
      await this.authService.handleTokenCreations({
        userId: userDto.id,
        userRole: userDto.role,
      });

    return { user: userDto, accessToken, refreshToken };
  }
}
