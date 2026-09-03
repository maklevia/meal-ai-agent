import { AuthUseCase } from "src/core/AuthUseCase.base";
import { AuthenticationError } from "src/errors/http/AuthenticationError";
import { AuthService } from "src/modules/auth/Auth.service";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository";

type ChangePasswordOptions = {
  userId: number;
  oldPassword: string;
  newPassword: string;
  currentRefreshToken: string
};

type ChangePasswordResult = void;

export class ChangePasswordUseCase extends AuthUseCase<
  ChangePasswordOptions,
  ChangePasswordResult
> {
  private readonly authService: AuthService = new AuthService();
  private readonly refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();

  async executeAuth(options: ChangePasswordOptions): Promise<ChangePasswordResult> {
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
