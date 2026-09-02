import { AuthUseCase } from "src/core/AuthUseCase.base";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository.js";

type LogoutOptions = {
  userId: number;
};

type LogoutResult = void;

export class LogoutUseCase extends AuthUseCase<LogoutOptions, LogoutResult> {
  private readonly refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();

  async executeAuth(options: LogoutOptions): Promise<LogoutResult> {
    const { userId } = options;

    await this.refreshTokenRepository.deleteTokensIfExist(userId);
  }
}
