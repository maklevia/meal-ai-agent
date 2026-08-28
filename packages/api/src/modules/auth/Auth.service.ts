import { compare, genSalt, hash } from "bcrypt-ts";
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";
import { RefreshTokenRepository } from "src/modules/auth/repositories/RefreshToken.repository.js";
import { AuthenticationError } from "src/errors/AppError.js";
import { AUTH_CONSTANTS, SALT_ROUNDS } from "src/modules/auth/constants.js";
import { env } from "src/config/env.js";
import { UserRole } from "src/modules/user/typedefs.js";
import { AppJwtPayload } from "src/modules/auth/typedefs.js";

type ComparePasswordsOptions = {
  passwordHash: string;
  givenPassword: string;
};

type UserPayloadInfo = {
  userId: number,
  userRole: UserRole,
}

export class AuthService {
  private readonly refreshTokenRepository: RefreshTokenRepository =
    new RefreshTokenRepository();

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
    payload: AppJwtPayload,
    secret: string,
    expiresIn: SignOptions["expiresIn"],
  ): string {
    return jwt.sign(payload, secret, { expiresIn });
  }

  generateAccessToken(payload: UserPayloadInfo): string {
    return this.signToken(
      { userId: payload.userId, userRole: payload.userRole },
      env.ACCESS_SECRET,
      AUTH_CONSTANTS.ACCESS_TOKEN_EXPIRES_IN,
    );
  }

  generateRefreshToken(payload: UserPayloadInfo): string {
    return this.signToken(
      { userId: payload.userId, userRole: payload.userRole },
      env.REFRESH_SECRET,
      AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN,
    );
  }

  private validateToken(token: string, secret: string): AppJwtPayload {
    try {
      const decoded = jwt.verify(token, secret) as AppJwtPayload;
      if (
        typeof decoded === "string" ||
        typeof decoded?.userId !== "number" ||
        typeof decoded.userRole !== "string" ||
        !Object.values(UserRole).includes(decoded.userRole)
      ) {
        throw new AuthenticationError("Invalid token payload");
      }

      return {
        userId: decoded.userId,
        userRole: decoded.userRole,
      };
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError)
        throw new AuthenticationError("Token expired");
      if (err instanceof jwt.JsonWebTokenError)
        throw new AuthenticationError("Invalid token");
      throw err;
    }
  }

  validateAccessToken(accessToken: string): AppJwtPayload {
    const result = this.validateToken(accessToken, env.ACCESS_SECRET);
    return result;
  }

  validateRefreshToken(refreshToken: string): AppJwtPayload {
    const result = this.validateToken(refreshToken, env.REFRESH_SECRET);
    return result;
  }

  async handleTokenCreations(
    payload: UserPayloadInfo,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(payload);
    const refreshToken = this.generateRefreshToken(payload);

    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(
      tokenExpiresAt.getDate() + AUTH_CONSTANTS.REFRESH_TOKEN_EXPIRES_IN_DAYS,
    );

    const { userId } = payload;
    await this.refreshTokenRepository.storeToken({
      userId: userId,
      refreshToken: refreshToken,
      expiresAt: tokenExpiresAt,
    });

    return { accessToken, refreshToken };
  }
}
