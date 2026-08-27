import { compare, genSalt, hash } from "bcrypt-ts";
import { UserRepository } from "src/modules/user/User.repository";
import jwt, {
  JsonWebTokenError,
  JwtPayload,
  SignOptions,
  VerifyErrors,
} from "jsonwebtoken";
import { RefreshTokenRepository } from "src/modules/auth/RefreshToken.repository";
import { AuthenticationError } from "src/errors/AppError";

type ComparePasswordsOptions = {
  passwordHash: string;
  givenPassword: string;
};

export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly refreshTokenRepository: RefreshTokenRepository,
  ) {}
  private readonly saltRounds = 10;

  async hashPassword(password: string): Promise<string> {
    const salt = await genSalt(this.saltRounds);
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
    //make this dissapear pls
    const accessSecret = process.env.ACCESS_SECRET;
    if (!accessSecret) {
      throw new Error();
    }

    return this.signToken({ userId }, accessSecret, "5m");
  }

  generateRefreshToken(userId: number): string {
    //make this dissapear pls
    const refreshSecret = process.env.REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error();
    }

    return this.signToken({ userId }, refreshSecret, "7d");
  }

  private validateToken(
    token: string,
    secret: string,
  ): {userId: number}  {
    try {
      const decoded = jwt.verify(token, secret) as JwtPayload;
      if (typeof decoded === "string" || typeof decoded?.userId !== "number") {
        throw new AuthenticationError("Invalid token payload");
      }

      return {userId: decoded.userId};
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) throw new AuthenticationError("Token expired");
      if (err instanceof jwt.JsonWebTokenError) throw new AuthenticationError('Invalid token');
      throw err;
    }
  }

  validateAccessToken(accessToken: string): number {
    //change
    const accessSecret = process.env.ACCESS_TOKEN;
    if (!accessSecret) throw Error();

    const { userId } = this.validateToken(accessToken, accessSecret);
    return userId;
  }

  validateRefreshToken(refreshToken: string): number {
    //change
    const refreshSecret = process.env.REFRESH_TOKEN;
    if (!refreshSecret) throw Error();

    const { userId } = this.validateToken(refreshToken, refreshSecret);
    return userId;
  }

  async handleTokenCreations(
    userId: number,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessToken = this.generateAccessToken(userId);
    const refreshToken = this.generateRefreshToken(userId);

    const tokenExpiresAt = new Date();
    tokenExpiresAt.setDate(tokenExpiresAt.getDate() + 7);

    await this.refreshTokenRepository.storeToken({
      userId: userId,
      refreshToken: refreshToken,
      expiresAt: tokenExpiresAt,
    });

    return { accessToken, refreshToken };
  }
}
