import { parse } from "cookie";
import {
  AuthenticationError,
  AuthErrorMessages,
  NotFoundError,
} from "src/errors";
import { AuthService } from "src/modules/auth/Auth.service";
import { COOKIE_NAMES } from "src/modules/auth/constants";
import { UserRepository } from "src/modules/user/repositories/User.repository";
import {
    AppSocket,
} from "src/sockets/typedefs";
import jwt from "jsonwebtoken";
import { toHandshakeError } from "src/sockets/error";

export class SocketAuthMiddleware {
  constructor(
    private readonly authServive: AuthService = new AuthService(),
    private readonly userRepository: UserRepository = new UserRepository(),
  ) {}

  handle = async (
    socket: AppSocket,
    next: (err?: Error) => void,
  ): Promise<void> => {
    try {
      const accessToken = this.extractAccessToken(socket);

      const { userId, userRole } =
        this.authServive.validateAccessToken(accessToken);

      const user = await this.userRepository.findUserById(userId);
      if (!user) {
        throw new NotFoundError(AuthErrorMessages.USER_NOT_FOUND);
      }

      if (user.role !== userRole) {
        throw new AuthenticationError(AuthErrorMessages.TOKEN_CLAIMS_OUTDATED);
      }

      socket.data.user = user;
      socket.data.expiresAt = this.readExpiryOfToken(accessToken);

      next();
    } catch (error) {
      next(toHandshakeError(error));
    }
  };

  private extractAccessToken(socket: AppSocket): string {
    const rawCookie = socket.handshake.headers.cookie;
    const accessToken = rawCookie
      ? parse(rawCookie)[COOKIE_NAMES.ACCESS_TOKEN]
      : undefined;

    if (!accessToken) {
      throw new AuthenticationError(AuthErrorMessages.NOT_AUTHENTICATED);
    }

    return accessToken;
  }

  private readExpiryOfToken(accessToken: string): number | null {
    const decoded = jwt.decode(accessToken);

    if (
      decoded &&
      typeof decoded === "object" &&
      typeof decoded.exp === "number"
    ) {
      return decoded.exp * 1000;
    }
    return null;
  }
}
