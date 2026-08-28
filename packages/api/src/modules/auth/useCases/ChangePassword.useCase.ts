import { UseCase } from "src/core/UseCase.base.js";
import { AuthenticationError } from "src/errors/AppError.js";
import { AuthService } from "src/modules/auth/Auth.service.js";
import { UserRepository } from "src/modules/user/repositories/User.repository.js";

type ChangePasswordOptions = {
  userId: number;
  oldPassword: string;
  newPassword: string;
};

type ChangePasswordResult = void;

export class ChangePasswordUseCase extends UseCase<
  ChangePasswordOptions,
  ChangePasswordResult
> {
  private readonly userRepository: UserRepository = new UserRepository();
  private readonly authServive: AuthService = new AuthService();

  async execute(options: ChangePasswordOptions): Promise<ChangePasswordResult> {
    const { oldPassword, newPassword, userId } = options;

    const existingUser =
      await this.userRepository.findUserForPasswordChange(userId);

    if (!existingUser || !existingUser.passwordHash) {
      throw new AuthenticationError("Invalid credentials");
    }

    const doPasswordsMatch = this.authServive.comparePasswords({
      givenPassword: oldPassword,
      passwordHash: existingUser.passwordHash,
    });

    if (!doPasswordsMatch) {
      throw new AuthenticationError("Old password is not valid");
    }

    const newPasswordHash = await this.authServive.hashPassword(newPassword);

    await this.userRepository.updatePassword({
      userId: existingUser.id,
      newPasswordHash,
    });

    return;
  }
}
