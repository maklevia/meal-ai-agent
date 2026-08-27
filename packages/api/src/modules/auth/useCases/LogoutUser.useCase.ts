import { UseCase } from "src/core/UseCase.base";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository";

type LogoutOptions = {
  userId: number;
};

type LogoutResult = void;

export class LogoutUseCase extends UseCase<LogoutOptions, LogoutResult> {
  constructor(
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {
    super();
  }

  async execute(options: LogoutOptions): Promise<LogoutResult> {
    const { userId } = options;

    await this.refreshTokenRepository.deleteToken(userId);
  }
}
