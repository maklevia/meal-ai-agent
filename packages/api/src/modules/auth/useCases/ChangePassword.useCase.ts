import { UseCase } from "src/core/UseCase.base.js";
import { AuthenticationError } from "src/errors/AppError.js";
import { AuthService } from "src/modules/auth/Auth.service.js";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository.js";
import { UserRepository } from "src/modules/user/repositories/User.repository.js";

type ChangePasswordOptions = {
  userId: number;
  oldPassword: string;
  newPassword: string;
  currentRefreshToken: string
};

type ChangePasswordResult = void;

export class ChangePasswordUseCase extends UseCase<
  ChangePasswordOptions,
  ChangePasswordResult
> {
  private readonly userRepository: UserRepository = new UserRepository();
  private readonly authService: AuthService = new AuthService();
  private readonly refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();

  async execute(options: ChangePasswordOptions): Promise<ChangePasswordResult> {
    const { oldPassword, newPassword, userId, currentRefreshToken } = options;

    const existingUser =
      await this.userRepository.findUserForPasswordChange(userId);

    if (!existingUser || !existingUser.passwordHash) {
      throw new AuthenticationError("Invalid credentials");
    }

    const doPasswordsMatch = await this.authService.comparePasswords({
      givenPassword: oldPassword,
      passwordHash: existingUser.passwordHash,
    });

    if (!doPasswordsMatch) {
      throw new AuthenticationError("Old password is not valid");
    }

    const newPasswordHash = await this.authService.hashPassword(newPassword);

    await this.userRepository.updatePassword({
      userId: existingUser.id,
      newPasswordHash,
    });

    await this.refreshTokenRepository.deleteAllUserTokensExcept({userId: existingUser.id, tokenToKeep: currentRefreshToken});
    
    return;
  }
}
