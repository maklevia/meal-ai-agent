import { AuthUseCase } from "src/core/AuthUseCase.base";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository";

type LogoutOptions = {
  refreshToken: string;
};

type LogoutResult = void;

export class LogoutUseCase extends AuthUseCase<LogoutOptions, LogoutResult> {
  private readonly refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();

  async executeAuth(options: LogoutOptions): Promise<LogoutResult> {
    const { refreshToken } = options;

    await this.refreshTokenRepository.deleteTokenForUser(this.user.id, refreshToken);
  }
}
