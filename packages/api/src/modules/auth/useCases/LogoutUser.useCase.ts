import { UseCase } from "src/core/UseCase.base.js";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository.js";

type LogoutOptions = {
  userId: number;
};

type LogoutResult = void;

export class LogoutUseCase extends UseCase<LogoutOptions, LogoutResult> {
  private readonly refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();

  async execute(options: LogoutOptions): Promise<LogoutResult> {
    const { userId } = options;

    await this.refreshTokenRepository.deleteToken(userId);
  }
}
