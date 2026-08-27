import { compare, genSalt, hash } from "bcrypt-ts";
import jwt, {
  JwtPayload,
  SignOptions,
} from "jsonwebtoken";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository";
import { AuthenticationError } from "src/errors/AppError";
import { AUTH_CONSTANTS, SALT_ROUNDS } from "src/modules/auth/constants";
import { env } from "src/config/env";

type ComparePasswordsOptions = {
  passwordHash: string;
  givenPassword: string;
};

export class AuthService {
  private readonly refreshTokenRepository: RefreshTokenRepository = new RefreshTokenRepository();

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(SALT_ROUNDS);
    const hashedPassword = await hash(password, salt);

    return hashedPassword;
  }

  async comparePasswords(options: ComparePasswordsOptions): Promise<boolean> {
    const { passwordHash, givenPassword } = options;

    return await compare(givenPassword, passwordHash);
  }

  private signToken(
    payload: JwtPayload,
    secret: string,
    expiresIn: SignOptions["expiresIn"],
  ): string {
    return jwt.sign(payload, secret, { expiresIn });
  }

  generateAccessToken(userId: number): string {
    return this.signToken({ userId }, env.ACCESS_SECRET, AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN);
  }

  generateRefreshToken(userId: number): string {
    return this.signToken({ userId }, env.REFRESH_SECRET,  AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN);
  }

  private validateToken(token: string, secret: string): { userId: number } {
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      if (typeof decoded === "string" || typeof decoded?.userId !== "number") {
        throw new AuthenticationError("Invalid token payload");
      }

      return { userId: decoded.userId };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError)
        throw new AuthenticationError("Token expired");
      if (err instanceof jwt.JsonWebTokenError)
        throw new AuthenticationError("Invalid token");
      throw err;
    }
  }

  validateAccessToken(accessToken: string): number {
    const { userId } = this.validateToken(accessToken, env.ACCESS_SECRET);
    return userId;
  }

  validateRefreshToken(refreshToken: string): number {
    const { userId } = this.validateToken(refreshToken, env.REFRESH_SECRET);
    return userId;
  }

  async handleTokenCreations(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + parseInt(AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN));

    await this.refreshTokenRepository.storeToken({
      userId: userId,
      refreshToken: refreshToken,
      expiresAt: tokenExpiresAt,
    });

    return { accessToken, refreshToken };
  }
}
