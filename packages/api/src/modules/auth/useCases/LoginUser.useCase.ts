import { UseCase } from "src/core/UseCase.base.js";
import { AuthenticationError } from "src/errors/http/AuthenticationError.js";
import { AuthService } from "src/modules/auth/Auth.service.js";
import { toUserDto, UserDto } from "src/modules/user/typedefs.js";

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

