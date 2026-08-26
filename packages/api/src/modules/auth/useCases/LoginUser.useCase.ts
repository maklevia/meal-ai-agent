import { UseCase } from "src/core/UseCase.base";
import { AuthService } from "src/modules/auth/authService";
import { User } from "src/modules/user/User.entity";
import { UserRepository } from "src/modules/user/User.repository";

type LoginOptions = {
  email: string;
  password: string;
};

type LoginResult = User;

export class LoginUserUseCase extends UseCase<LoginOptions, LoginResult> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async execute(options: LoginOptions): Promise<LoginResult> {
    const { email, password } = options;

    const existingUser = await this.userRepository.findUserForLogin(email);
    if (!existingUser || !existingUser.passwordHash) {
      throw new Error();
    }

    const doPasswordsMatch = this.authService.comparePasswords({
      passwordHash: existingUser.passwordHash,
      givenPassword: password,
    });

    if (!doPasswordsMatch) {
      throw new Error();
    }

    delete existingUser.passwordHash;

    return existingUser;
  }
}
