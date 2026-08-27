import { UseCase } from "src/core/UseCase.base";
import { AuthenticationError } from "src/errors/AppError";
import { AuthService } from "src/modules/auth/Auth.service";
import { User } from "src/modules/user/User.entity";
import { UserRepository } from "src/modules/user/User.repository";

type LoginOptions = {
  email: string;
  password: string;
};

type LoginResult = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export class LoginUserUseCase extends UseCase<LoginOptions, LoginResult> {
  private readonly userRepository: UserRepository = new UserRepository();
  private readonly authService: AuthService = new AuthService();

  async execute(options: LoginOptions): Promise<LoginResult> {
    const { email, password } = options;

    const existingUser = await this.userRepository.findUserForLogin(email);
    if (!existingUser || !existingUser.passwordHash) {
      throw new AuthenticationError("Invalid credentials.");
    }

    const doPasswordsMatch = await this.authService.comparePasswords({
      passwordHash: existingUser.passwordHash,
      givenPassword: password,
    });

    if (!doPasswordsMatch) {
      throw new AuthenticationError("Invalid credentials.");
    }

    delete existingUser.passwordHash;

    const { accessToken, refreshToken } =
      await this.authService.handleTokenCreations(existingUser.id);

    return { user: existingUser, accessToken, refreshToken };
  }
}
