import { UseCase } from "src/core/UseCase.base.js";
import { AuthenticationError } from "src/errors/AppError.js";
import { AuthService } from "src/modules/auth/Auth.service.js";
import { PasswordResetCodeRepository } from "src/modules/auth/repositories/PasswordResetCode.repository.js";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository.js";
import { UserRepository } from "src/modules/user/repositories/User.repository.js";

type ResetPasswordOptions = {
  resetCode: string;
  newPassword: string;
};

type ResetPasswordResult = {
    accessToken: string;
    refreshToken: string;
};

export class ResetPasswordUsingLinkUseCase extends UseCase<
  ResetPasswordOptions,
  ResetPasswordResult
> {
  private readonly passwordResetCodeRepository: PasswordResetCodeRepository =
    new PasswordResetCodeRepository();
  private readonly authService: AuthService = new AuthService();
  private readonly userRepository: UserRepository = new UserRepository();
  private readonly refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();

  async execute(options: ResetPasswordOptions): Promise<ResetPasswordResult> {
    const { resetCode, newPassword } = options;

    const codeHash = this.authService.hashString(resetCode);

    const codeRecord =
      await this.passwordResetCodeRepository.findResetCode(codeHash);
    if (!codeRecord) {
      throw new AuthenticationError("Invalid reset code");
    }

    if (codeRecord.expiresAt < new Date()) {
      throw new AuthenticationError("Reset code has expired")
    }

    const userId = codeRecord.user.id
    const userRole = codeRecord.user.role; 
    const newPasswordHash = await this.authService.hashPassword(newPassword);

    await this.userRepository.updatePassword({newPasswordHash, userId });

    await this.refreshTokenRepository.deleteAllUserTokens(userId);
    await this.passwordResetCodeRepository.deleteAllUserResetCodes(userId);

    const {accessToken, refreshToken} = await this.authService.handleTokenCreations({userId, userRole});
    return {accessToken, refreshToken};
  }
}
