import { UseCase } from "src/core/UseCase.base";
import { ConflictError } from "src/errors/AppError";
import { AuthService } from "src/modules/auth/Auth.service";
import { User } from "src/modules/user/entities/User.entity";
import { UserRepository } from "src/modules/user/repositories/User.repository";

type RegisterOptions = {
  email: string;
  password: string;
  name: string;
};

type RegisterResult = {
  user: User;
  accessToken: string;
  refreshToken: string;
};

export class RegisterUserUseCase extends UseCase<
  RegisterOptions,
  RegisterResult
> {
  private readonly userRepository: UserRepository = new UserRepository();
  private readonly authService: AuthService = new AuthService();

  async execute(options: RegisterOptions): Promise<RegisterResult> {
    const { email, password, name } = options;

    const isUserRegistered = await this.userRepository.existsByEmail(email);
    if (isUserRegistered) {
      throw new ConflictError("Email is already taken.");
    }

    const passwordHash = await this.authService.hashPassword(password);
    const createdUser = await this.userRepository.createUser({
      email,
      passwordHash,
      name,
    });

    const { accessToken, refreshToken } =
      await this.authService.handleTokenCreations(createdUser.id);

    return { user: createdUser, accessToken, refreshToken };
  }
}
