import { UseCase } from "src/core/UseCase.base.js";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository.js";

type LogoutOptions = {
  token: string;
};

type LogoutResult = void;

export class LogoutUseCase extends UseCase<LogoutOptions, LogoutResult> {
  private readonly refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();

  async execute(options: LogoutOptions): Promise<LogoutResult> {
    const { token } = options;

    await this.refreshTokenRepository.deleteTokenByValue(token);
  }
}
