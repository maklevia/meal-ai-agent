import { UseCase } from "src/core/UseCase.base";
import { AuthenticationError } from "src/errors/http/AuthenticationError";
import { AuthService } from "src/modules/auth/Auth.service";
import { toUserDto, UserDto } from "src/modules/user/typedefs";

type LoginOptions = {
  email: string;
  password: string;
};

type LoginResult = {
  user: UserDto;
  accessToken: string;
  refreshToken: string;
};

export class LoginUserUseCase extends UseCase<LoginOptions, LoginResult> {
  private readonly authService: AuthService = new AuthService();

  async execute(options: LoginOptions): Promise<LoginResult> {
    const { email, password } = options;

    const existingUser = await this.requireUserByEmail(email);

    const doPasswordsMatch = await this.authService.comparePasswords({
      passwordHash: existingUser.passwordHash!,
      givenPassword: password,
    });

    if (!doPasswordsMatch) {
      throw new AuthenticationError("Invalid credentials.");
    }

    const { accessToken, refreshToken } =
      await this.authService.handleTokenCreations({ userId: existingUser.id, userRole: existingUser.role });

    return { user: toUserDto(existingUser), accessToken, refreshToken };
  }
}

