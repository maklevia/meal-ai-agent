import { UseCase } from "src/core/UseCase.base.js";
import { AuthenticationError } from "src/errors/AppError.js";
import { AuthService } from "src/modules/auth/Auth.service.js";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository.js";

type RefreshOptions = {
  refreshToken: string;
};

type RefreshResult = {
  accessToken: string;
};

export class RefreshUseCase extends UseCase<RefreshOptions, RefreshResult> {
  private readonly refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();
  private readonly authService: AuthService = new AuthService();

  async execute(options: RefreshOptions): Promise<RefreshResult> {
    const { refreshToken } = options;

    const {userId, userRole} = this.authService.validateRefreshToken(refreshToken);

    const storedRefreshToken =
      await this.refreshTokenRepository.findByToken(refreshToken);

    if (
      !storedRefreshToken ||
      storedRefreshToken.user.id !== userId ||
      storedRefreshToken.expiresAt < new Date()
    ) {
      throw new AuthenticationError("Invalid token");
    }

    const accessToken = this.authService.generateAccessToken({userId, userRole});
    return { accessToken };
  }
}
