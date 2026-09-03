import { UseCase } from "src/core/UseCase.base";
import { AuthService } from "src/modules/auth/Auth.service";
import { PasswordResetCodeRepository } from "src/modules/auth/repositories/PasswordResetCode.repository";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository";

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
  private readonly refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();

  async execute(options: ResetPasswordOptions): Promise<ResetPasswordResult> {
    const { resetCode, newPassword } = options;

    const codeRecord = await this.authService.assertValidResetCode(resetCode);

    const userId = codeRecord.user.id;
    const userRole = codeRecord.user.role;
    const newPasswordHash = await this.authService.hashPassword(newPassword);

    await this.userRepository.updatePassword({newPasswordHash, userId });

    await this.refreshTokenRepository.deleteTokensIfExist(userId);
    await this.passwordResetCodeRepository.deleteAllUserResetCodes(userId);

    const {accessToken, refreshToken} = await this.authService.handleTokenCreations({userId, userRole});
    return {accessToken, refreshToken};
  }
}
