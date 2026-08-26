import { compare, genSalt, hash } from "bcrypt-ts";
import { UserRepository } from "src/modules/user/User.repository";
import jwt, { JsonWebTokenError, JwtPayload, SignOptions } from "jsonwebtoken";
import { error } from "console";

type ComparePasswordsOptions = {
  passwordHash: string;
  givenPassword: string;
};

export class AuthService {
  constructor(private readonly userRepository: UserRepository) {}
  private readonly saltRounds = 20;

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

    return this.signToken({userId}, accessSecret, "5m");
  }

  generateRefreshToken(userId: number): string {
    //make this dissapear pls
    const refreshSecret = process.env.REFRESH_SECRET;
    if (!refreshSecret) {
      throw new Error();
    }

    return this.signToken({userId}, refreshSecret, "7d");
  }

  private validateToken(
    token: string, 
    secret: string,
    callback: (
        error: JsonWebTokenError | null, 
        decoded: JwtPayload | string | undefined,
    ) => void
): void {
    jwt.verify(token, secret, (error, decoded) => callback(error, decoded));
  }
}
