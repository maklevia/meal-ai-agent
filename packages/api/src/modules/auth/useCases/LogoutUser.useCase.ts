import { UseCase } from "src/core/UseCase.base";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository";

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
