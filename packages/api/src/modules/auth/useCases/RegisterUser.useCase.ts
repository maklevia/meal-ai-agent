import { UseCase } from "src/core/UseCase.base";
import { AuthService } from "src/modules/auth/authService";
import { User } from "src/modules/user/User.entity";
import { UserRepository } from "src/modules/user/User.repository";

type RegisterOptions = {
  email: string;
  password: string;
  name: string;
};

type RegisterResult = User;

export class RegisterUserUseCase extends UseCase<
  RegisterOptions,
  RegisterResult
> {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly authService: AuthService,
  ) {
    super();
  }

  async execute(options: RegisterOptions): Promise<RegisterResult> {
    const { email, password, name } = options;

    const isUserRegistered = await this.userRepository.existsByEmail(email);
    if (isUserRegistered) {
        throw new Error();
    }
    
    const passwordHash = await this.authService.hashPassword(password);
    const createdUserProfile = await this.userRepository.createUser({email, passwordHash, name});

    return createdUserProfile;
  }
}
